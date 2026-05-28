-- =====================================================
-- Migration: 002_align_copilot_modes
-- Description: Align stored conversation modes with runtime contract
-- Created: 2026
-- =====================================================

ALTER TABLE conversations
  DROP CONSTRAINT IF EXISTS conversations_mode_check;

UPDATE conversations
SET mode = 'execute'
WHERE mode = 'agent';

ALTER TABLE conversations
  ADD CONSTRAINT conversations_mode_check
  CHECK (mode IN ('ask', 'plan', 'execute', 'debug'));
