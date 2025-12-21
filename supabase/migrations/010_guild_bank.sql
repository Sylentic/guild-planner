-- =====================================================
-- 010_guild_bank.sql - Guild Bank & Resource Tracker
-- Track shared guild resources and materials
-- =====================================================

-- Resource category enum
DO $$ BEGIN
  CREATE TYPE resource_category AS ENUM (
    'raw_material',     -- Ore, wood, herbs
    'processed',        -- Ingots, planks, reagents
    'consumable',       -- Potions, food, scrolls
    'equipment',        -- Weapons, armor, accessories
    'currency',         -- Gold, premium currencies
    'blueprint',        -- Crafting recipes
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Transaction type enum
DO $$ BEGIN
  CREATE TYPE bank_transaction_type AS ENUM (
    'deposit',
    'withdrawal',
    'transfer',
    'craft_input',      -- Used for crafting
    'craft_output',     -- Created from crafting
    'loot',             -- From raid/siege
    'purchase',
    'sale',
    'adjustment'        -- Manual correction
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Guild bank configuration
CREATE TABLE IF NOT EXISTS guild_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  -- Settings
  name VARCHAR(100) DEFAULT 'Guild Bank',
  description TEXT,
  -- Permissions
  deposit_min_role VARCHAR(20) DEFAULT 'member', -- member, officer, admin
  withdraw_min_role VARCHAR(20) DEFAULT 'officer',
  -- Gold tracking
  gold_balance BIGINT DEFAULT 0,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One bank per clan
  UNIQUE(clan_id)
);

-- Resource catalog (what items exist)
CREATE TABLE IF NOT EXISTS resource_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Item details
  name VARCHAR(200) NOT NULL,
  category resource_category NOT NULL,
  subcategory VARCHAR(100), -- e.g. 'metal', 'cloth', 'leather'
  rarity item_rarity DEFAULT 'common', -- reuse from loot
  -- Pricing
  base_value INTEGER DEFAULT 0,
  -- Crafting info
  is_craftable BOOLEAN DEFAULT FALSE,
  profession_required VARCHAR(50),
  -- Global catalog, not clan-specific
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Unique item names
  UNIQUE(name)
);

-- Guild bank inventory
CREATE TABLE IF NOT EXISTS bank_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID NOT NULL REFERENCES guild_banks(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resource_catalog(id) ON DELETE CASCADE,
  -- Quantity tracking
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  -- Reserved for pending requests
  reserved_quantity INTEGER DEFAULT 0 CHECK (reserved_quantity >= 0),
  -- Metadata
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One entry per resource per bank
  UNIQUE(bank_id, resource_id)
);

-- Bank transactions (audit log)
CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID NOT NULL REFERENCES guild_banks(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resource_catalog(id) ON DELETE SET NULL,
  -- Transaction details
  transaction_type bank_transaction_type NOT NULL,
  quantity INTEGER NOT NULL,
  gold_amount BIGINT DEFAULT 0,
  -- Who did it
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  character_id UUID REFERENCES members(id) ON DELETE SET NULL,
  -- Context
  notes TEXT,
  related_siege_id UUID REFERENCES siege_events(id) ON DELETE SET NULL,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource requests (members requesting withdrawals)
CREATE TABLE IF NOT EXISTS resource_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID NOT NULL REFERENCES guild_banks(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resource_catalog(id) ON DELETE CASCADE,
  -- Request details
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES members(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT,
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'fulfilled')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_guild_banks_clan ON guild_banks(clan_id);
CREATE INDEX IF NOT EXISTS idx_resource_catalog_category ON resource_catalog(category);
CREATE INDEX IF NOT EXISTS idx_bank_inventory_bank ON bank_inventory(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_inventory_resource ON bank_inventory(resource_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_bank ON bank_transactions(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_created ON bank_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_resource_requests_bank ON resource_requests(bank_id);
CREATE INDEX IF NOT EXISTS idx_resource_requests_status ON resource_requests(status);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE guild_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_requests ENABLE ROW LEVEL SECURITY;

-- Guild banks: clan members can view
CREATE POLICY "Clan members can view bank"
  ON guild_banks FOR SELECT
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member']));

-- Only officers can manage bank settings
CREATE POLICY "Officers can manage bank"
  ON guild_banks FOR ALL
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

-- Resource catalog: everyone can view (global)
CREATE POLICY "Everyone can view resources"
  ON resource_catalog FOR SELECT
  USING (true);

-- Only system can manage catalog
CREATE POLICY "System can manage catalog"
  ON resource_catalog FOR ALL
  USING (false);

-- Inventory: clan members can view
CREATE POLICY "Clan members can view inventory"
  ON bank_inventory FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM guild_banks gb
      WHERE gb.id = bank_inventory.bank_id
      AND user_has_clan_role(gb.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
    )
  );

-- Officers can manage inventory
CREATE POLICY "Officers can manage inventory"
  ON bank_inventory FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM guild_banks gb
      WHERE gb.id = bank_inventory.bank_id
      AND user_has_clan_role(gb.clan_id, auth.uid(), ARRAY['admin', 'officer'])
    )
  );

-- Transactions: clan members can view
CREATE POLICY "Clan members can view transactions"
  ON bank_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM guild_banks gb
      WHERE gb.id = bank_transactions.bank_id
      AND user_has_clan_role(gb.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
    )
  );

-- Members can create transactions (deposits)
CREATE POLICY "Members can create transactions"
  ON bank_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM guild_banks gb
      WHERE gb.id = bank_transactions.bank_id
      AND user_has_clan_role(gb.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
    )
  );

-- Resource requests: own or officer view
CREATE POLICY "Users can view own requests or officers all"
  ON resource_requests FOR SELECT
  USING (
    requested_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM guild_banks gb
      WHERE gb.id = resource_requests.bank_id
      AND user_has_clan_role(gb.clan_id, auth.uid(), ARRAY['admin', 'officer'])
    )
  );

-- Members can create requests
CREATE POLICY "Members can create requests"
  ON resource_requests FOR INSERT
  WITH CHECK (
    requested_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM guild_banks gb
      WHERE gb.id = resource_requests.bank_id
      AND user_has_clan_role(gb.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
    )
  );

-- Officers can review requests
CREATE POLICY "Officers can review requests"
  ON resource_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM guild_banks gb
      WHERE gb.id = resource_requests.bank_id
      AND user_has_clan_role(gb.clan_id, auth.uid(), ARRAY['admin', 'officer'])
    )
  );

-- =====================================================
-- SEED: Common AoC Resources
-- =====================================================

INSERT INTO resource_catalog (name, category, subcategory) VALUES
  -- Metals
  ('Iron Ore', 'raw_material', 'metal'),
  ('Copper Ore', 'raw_material', 'metal'),
  ('Silver Ore', 'raw_material', 'metal'),
  ('Gold Ore', 'raw_material', 'metal'),
  ('Iron Ingot', 'processed', 'metal'),
  ('Steel Ingot', 'processed', 'metal'),
  -- Wood
  ('Oak Log', 'raw_material', 'wood'),
  ('Pine Log', 'raw_material', 'wood'),
  ('Ash Log', 'raw_material', 'wood'),
  ('Oak Plank', 'processed', 'wood'),
  ('Pine Plank', 'processed', 'wood'),
  -- Cloth
  ('Cotton', 'raw_material', 'cloth'),
  ('Silk', 'raw_material', 'cloth'),
  ('Linen Cloth', 'processed', 'cloth'),
  ('Silk Cloth', 'processed', 'cloth'),
  -- Leather
  ('Rawhide', 'raw_material', 'leather'),
  ('Thick Hide', 'raw_material', 'leather'),
  ('Leather', 'processed', 'leather'),
  ('Hardened Leather', 'processed', 'leather'),
  -- Herbs
  ('Healing Herb', 'raw_material', 'herb'),
  ('Mana Blossom', 'raw_material', 'herb'),
  ('Fire Petal', 'raw_material', 'herb'),
  -- Consumables
  ('Health Potion', 'consumable', 'potion'),
  ('Mana Potion', 'consumable', 'potion'),
  ('Stamina Potion', 'consumable', 'potion'),
  ('Feast Dish', 'consumable', 'food')
ON CONFLICT (name) DO NOTHING;

-- Comments
COMMENT ON TABLE guild_banks IS 'Guild bank configuration and gold tracking';
COMMENT ON TABLE resource_catalog IS 'Global catalog of all trackable resources';
COMMENT ON TABLE bank_inventory IS 'Current resource quantities in guild bank';
COMMENT ON TABLE bank_transactions IS 'Audit log of all bank transactions';
COMMENT ON TABLE resource_requests IS 'Member requests for resource withdrawals';
