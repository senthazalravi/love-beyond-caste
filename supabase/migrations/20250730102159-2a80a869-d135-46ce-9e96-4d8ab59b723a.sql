-- Disable email confirmation requirement
-- This allows users to authenticate without confirming their email
-- Update auth configuration to disable email confirmation
UPDATE auth.config SET enable_signup = true, enable_email_confirmations = false WHERE id = 'default';

-- If the config table doesn't exist or doesn't have the right structure, 
-- we'll handle this through the auth settings instead
-- For now, we'll ensure all existing users can authenticate regardless of email confirmation status