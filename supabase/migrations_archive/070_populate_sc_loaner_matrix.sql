-- Auto-populated loaner ship matrix from RSI Support
-- Source: https://support.robertsspaceindustries.com/hc/en-us/articles/360003093114-Loaner-Ship-Matrix
-- Last Updated: November 26th, 2025 | 4.4.0-live.10733565

BEGIN;

-- Clear any existing data
DELETE FROM sc_loaner_matrix;

-- Insert loaner mappings from RSI
-- Format: (pledged_ship, loaner_ship, loaner_type, notes)

-- 400i
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('400i', '325a', 'primary');

-- 600i series
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('600i Touring', '325a', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('600i Explorer', '325a', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('600i Explorer', 'Cyclone', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('600i Executive', '325a', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('600i Executive', 'Cyclone', 'primary');

-- 890 Jump
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('890 Jump', '325a', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('890 Jump', '85x', 'primary');

-- Arrastra (with temporary Prospector loaner due to bug STARC-113044)
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type, notes) VALUES ('Arrastra', 'Prospector', 'temporary', 'Temporary due to mining HUD issues (STARC-113044)');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type, notes) VALUES ('Arrastra', 'Mole', 'temporary', 'Temporary due to mining HUD issues (STARC-113044)');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Arrastra', 'Arrow', 'arena_commander');

-- Carrack series
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Carrack', 'C8 Pisces', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Carrack', 'URSA Rover', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Carrack Expedition', 'C8 Pisces', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Carrack Expedition', 'URSA Rover', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Carrack w/ C8X', 'C8X Pisces Expedition', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Carrack w/ C8X', 'URSA Rover', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Carrack Expedition w/C8X', 'C8X Pisces Expedition', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Carrack Expedition w/C8X', 'URSA Rover', 'primary');

-- Caterpillar
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Caterpillar', 'Buccaneer', 'primary');

-- Centurion
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Centurion', 'Aurora MR', 'primary');

-- Constellation series
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Constellation Andromeda', 'P-52 Merlin', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Constellation Aquila', 'P-52 Merlin', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Constellation Aquila', 'URSA Rover', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Constellation Phoenix', 'P-72 Archimedes', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Constellation Phoenix', 'Lynx Rover', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Constellation Phoenix Emerald', 'P-72 Archimedes', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Constellation Phoenix Emerald', 'Lynx Rover', 'primary');

-- Corsair
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Corsair', 'Buccaneer', 'primary');

-- Crucible
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Crucible', 'Constellation Andromeda', 'primary');

-- CSV-SM
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('CSV-SM', 'Aurora MR', 'primary');

-- Cyclone Variants
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Cyclone', 'Aurora MR', 'primary');

-- Dragonfly
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Dragonfly', 'Aurora MR', 'primary');

-- E1 Spirit
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('E1 Spirit', 'A1 Spirit', 'primary');

-- Endeavor
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Endeavor', 'Starfarer', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Endeavor', 'Cutlass Red', 'primary');

-- Expanse
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Expanse', 'Prospector', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Expanse', 'Reliant Kore', 'primary');

-- Fury Variants
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Fury', 'Aurora MR', 'primary');

-- G12 Variants
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('G12', 'Lynx', 'primary');

-- Galaxy
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Galaxy', 'Carrack', 'primary');

-- Genesis Starliner
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Genesis Starliner', 'Hercules C2', 'primary');

-- Hull series
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Hull B', 'Hull A', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Hull B', 'Arrow', 'arena_commander');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Hull C', 'Arrow', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Hull D', 'Hull C', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Hull D', 'Hercules C2', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Hull D', 'Arrow', 'arena_commander');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Hull E', 'Hull C', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Hull E', 'Hercules C2', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Hull E', 'Arrow', 'arena_commander');

-- Idris series
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Idris-M', 'F7C-M Super Hornet', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Idris-M', 'MPUV Passenger', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Idris-P', 'F7C-M Super Hornet', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Idris-P', 'MPUV Passenger', 'primary');

-- Ironclad series
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Ironclad', 'Caterpillar', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Ironclad Assault', 'Caterpillar', 'primary');

-- Javelin
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Javelin', 'Idris-P', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Javelin', 'MPUV Cargo', 'primary');

-- Kraken series
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Kraken', 'Polaris', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Kraken', 'Hercules C2', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Kraken', 'Caterpillar', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Kraken', 'Buccaneer', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Kraken Privateer', 'Polaris', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Kraken Privateer', 'Hercules C2', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Kraken Privateer', 'Caterpillar', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Kraken Privateer', 'Buccaneer', 'primary');

-- Liberator
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Liberator', 'Hercules M2', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Liberator', 'F7C-M Super Hornet', 'primary');

-- Legionnaire
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Legionnaire', 'Vanguard Hoplite', 'primary');

-- Lynx
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Lynx', 'Aurora MR', 'primary');

-- Mantis
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Mantis', 'Aurora LN', 'primary');

-- Merchantman
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Merchantman', 'Hull C', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Merchantman', 'Defender', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Merchantman', 'Hercules C2', 'primary');

-- Mole (with temporary Prospector loaner)
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type, notes) VALUES ('Mole', 'Prospector', 'temporary', 'Temporary due to mining HUD issues (STARC-113044)');

-- MPUV-Tractor
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('MPUV-Tractor', 'Aurora MR', 'primary');

-- MXC
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('MXC', 'Aurora MR', 'primary');

-- Mule
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Mule', 'Aurora MR', 'primary');

-- Nautilus
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Nautilus', 'Polaris', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Nautilus', 'Avenger Titan', 'primary');

-- Nova
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Nova', 'Aurora MR', 'primary');

-- Nox
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Nox', 'Aurora MR', 'primary');

-- Odyssey
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Odyssey', 'Carrack', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Odyssey', 'Reliant Kore', 'primary');

-- Orion (with temporary loaners)
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type, notes) VALUES ('Orion', 'Prospector', 'temporary', 'Temporary due to mining HUD issues (STARC-113044)');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type, notes) VALUES ('Orion', 'Mole', 'temporary', 'Temporary due to mining HUD issues (STARC-113044)');

-- Pioneer
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Pioneer', 'Caterpillar', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Pioneer', 'Nomad', 'primary');

-- Polaris
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Polaris', 'F7C-M Super Hornet', 'primary');

-- Pulse series
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Pulse', 'Aurora MR', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Pulse LX', 'Aurora MR', 'primary');

-- Railen
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Railen', 'Hercules C2', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Railen', 'Syulen', 'primary');

-- RAFT
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('RAFT', 'F7C Hornet', 'primary');

-- Ranger series
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Ranger CV', 'Cyclone', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Ranger RC', 'Cyclone RC', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Ranger TR', 'Cyclone TR', 'primary');

-- Redeemer
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Redeemer', 'Arrow', 'primary');

-- Retaliator
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Retaliator', 'Gladiator', 'primary');

-- SRV
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('SRV', 'Aurora LN', 'primary');

-- Storm Variants
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Storm', 'Aurora MR', 'primary');

-- STV
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('STV', 'Aurora MR', 'primary');

-- Terrapin series
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Terrapin', 'F7C-M Super Hornet', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Terrapin Medic', 'F7C-M Super Hornet', 'primary');

-- Valkyrie
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Valkyrie', 'F7C-M Super Hornet', 'primary');

-- Vulcan
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Vulcan', 'Starfarer', 'primary');

-- Vulture
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Vulture', 'Buccaneer', 'primary');

-- X1 series
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('X1', 'Aurora MR', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('X1 Velocity', 'Aurora MR', 'primary');
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('X1 Force', 'Aurora MR', 'primary');

-- Zeus Mk II MR
INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type) VALUES ('Zeus Mk II MR', 'Zeus Mk II ES', 'primary');

COMMIT;
