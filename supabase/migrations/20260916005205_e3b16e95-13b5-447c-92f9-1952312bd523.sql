ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS remark text;
ALTER TABLE public.deposit_requests ADD COLUMN IF NOT EXISTS remark text;

UPDATE public.withdrawal_requests
SET remark = NULLIF(btrim((account_info::jsonb ->> 'rejectionRemark')), '')
WHERE remark IS NULL
  AND account_info IS NOT NULL
  AND btrim(account_info) LIKE '{%'
  AND (account_info::jsonb ->> 'rejectionRemark') IS NOT NULL;