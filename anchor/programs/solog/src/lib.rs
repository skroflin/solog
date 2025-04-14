#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod solog {
    use super::*;

  pub fn close(_ctx: Context<CloseSolog>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.solog.count = ctx.accounts.solog.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.solog.count = ctx.accounts.solog.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeSolog>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.solog.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeSolog<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Solog::INIT_SPACE,
  payer = payer
  )]
  pub solog: Account<'info, Solog>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseSolog<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub solog: Account<'info, Solog>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub solog: Account<'info, Solog>,
}

#[account]
#[derive(InitSpace)]
pub struct Solog {
  count: u8,
}
