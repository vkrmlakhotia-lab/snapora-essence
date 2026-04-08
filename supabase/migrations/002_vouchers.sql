-- ============================================================
-- SNAPORA — Vouchers
-- Gift vouchers: generated when a user buys a gift,
-- redeemed by the recipient at checkout.
-- ============================================================

create table vouchers (
  id               uuid primary key default gen_random_uuid(),
  code             text unique not null,              -- e.g. SNAP-A1B2-C3D4
  sender_user_id   uuid references profiles(id) on delete set null,
  recipient_email  text not null,
  gift_message     text,
  amount_pence     integer not null default 2400,     -- £24 in pence
  used             boolean not null default false,
  used_at          timestamptz,
  used_by_user_id  uuid references profiles(id) on delete set null,
  order_id         uuid references orders(id) on delete set null,
  expires_at       timestamptz not null default (now() + interval '1 year'),
  created_at       timestamptz default now()
);

alter table vouchers enable row level security;

-- Sender can see vouchers they sent
create policy "Senders can view own vouchers" on vouchers
  for select using (auth.uid() = sender_user_id);

-- Anyone can look up a voucher by code (needed for redemption)
create policy "Anyone can look up a voucher by code" on vouchers
  for select using (true);

-- Authenticated users can insert (buying a gift)
create policy "Authenticated users can create vouchers" on vouchers
  for insert with check (auth.uid() = sender_user_id);

-- Only the system (service role) should mark a voucher as used.
-- Frontend marks via RPC to prevent client-side tampering.
create policy "Users can update own used vouchers" on vouchers
  for update using (auth.uid() = used_by_user_id);

-- ── RPC: redeem a voucher ──────────────────────────────────────────────────
-- Called at checkout to atomically mark the voucher as used.
-- Returns the voucher row on success, raises exception if invalid.

create or replace function redeem_voucher(p_code text, p_user_id uuid, p_order_id uuid)
returns vouchers as $$
declare
  v vouchers;
begin
  select * into v from vouchers
  where code = p_code
    and used = false
    and expires_at > now()
  for update;

  if not found then
    raise exception 'Voucher not found, already used, or expired';
  end if;

  update vouchers
  set used = true,
      used_at = now(),
      used_by_user_id = p_user_id,
      order_id = p_order_id
  where id = v.id
  returning * into v;

  return v;
end;
$$ language plpgsql security definer;
