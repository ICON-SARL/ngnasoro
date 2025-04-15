
import { z } from 'zod';

export const settingsSchema = z.object({
  loan_settings: z.object({
    min_loan_amount: z.number().min(0),
    max_loan_amount: z.number().min(0),
    default_interest_rate: z.number().min(0),
    late_payment_fee: z.number().min(0)
  }),
  transaction_settings: z.object({
    daily_withdrawal_limit: z.number().min(0),
    requires_2fa: z.boolean(),
    notification_enabled: z.boolean()
  }),
  security_settings: z.object({
    password_expiry_days: z.number().min(0),
    session_timeout_minutes: z.number().min(0),
    ip_whitelist: z.array(z.string())
  })
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
