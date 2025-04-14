#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod solog {
    use super::*;

  pub fn create_product(
    ctx: Context<CreateProduct>,
    product_id: String,
    name: String,
    description: String,
  ) -> Result<()> {
    msg!("New product created in the supply chain");
    msg!("Product id: {}", product_id);
    msg!("Name: {}", name);

    let product = &mut ctx.accounts.product;
    let creator = &ctx.accounts.creator;

    product.product_id = product_id;
    product.name = name;
    product.description = description;
    product.current_owner = *creator.key;
    product.current_status = String::from("Created");
    product.current_location = String::from("Origin");
    product.created_at = Clock::get()?.unix_timestamp;
    product.is_active = true;
    product.journal_entries_count = 1;

    let journal_entry = &mut ctx.accounts.journal_entry;
    journal_entry.product = product.key();
    journal_entry.owner = *creator.key;
    journal_entry.timestamp = Clock::get()?.unix_timestamp;
    journal_entry.title = String::from("Product Registration");
    journal_entry.message = initial_notes;
    journal_entry.status = String::from("Created");
    journal_entry.location = String::from("Origin");
    journal_entry.entry_number = 0;

    Ok(())
  }

  pub fn add_journal_entry(
    ctx: Context<AddJournalEntry>,
    title: String,
    message: String,
    new_status: String,
    new_location: String,
  ) -> Result<()> {
    msg!("Journal entry added to product");
    msg!("Title: {}", title);
    msg!("Status update: {}", new_status);

    let product = &mut ctx.accounts.product;
    let handler = &ctx.accounts.handler;

    require!(
      product.current_owner == handler.key();
      SupplyChainError::Unauthorized
    );

    product.current_status = new_status.clone();
    product.current_location = new_location.clone();
    product.journal_entries_count += 1;

    let journal_entry = &mut ctx.accounts.journal_entry;
    journal_entry.product = product.key();
    journal_entry.owner = *handler.key;
    journal_entry.timestamp = Clock::get()?.unix_timestamp;
    journal_entry.title = title;
    journal_entry.message = message;
    journal_entry.status = status;
    journal_entry.location = new location;
    journal_entry.entry_number = product.journal_entries_count - 1;

    Ok(())
  }
  
  pub fn transfer_product(
    ctx: Context<TransferProduct>,
    title: String,
    message: String,
    new_location: String,
  ) -> Result<()> {
    msg!("Product ownership transferred");
    msg!("Title: {}", title);
    msg!("New location: {}", new_location);

    let product = &mut ctx.accounts.product;
    let current_owner = &ctx.accounts.current_owner;
    let new_owner = &ctx.accounts.new_owner;

    require!(product.is_active, SupplyChainError::ProductInactive);

    product.current_owner = *new_owner.key;
    product.current_location = new_location.clone();
    product.current_status = String::from("Transferred");
    product.journal_entries_count += 1;

    let journal_entry = &mut ctx.accounts.journal_entry;
    journal_entry.product = product.key();
    journal_entry.owner = *current_owner.key;
    journal_entry.timestamp = Clock::get()?.unix_timestamp;
    journal_entry.title = title;
    journal_entry.message = message;
    journal_entry.status = String::from("Transferred");
    journal_entry.location = new_location;
    journal_entry.entry_number = product.journal_entries_count - 1;

    ok(())
  }

  pub fn mark_delivered(
    ctx: Context<UpdateProductStatus>,
    title: String,
    message: String,
  ) -> Result<()> {
    msg!("Product marked as delivered");
    msg!("Title: {}", title);

    let product = &mut ctx.accounts.product;
    let handler = &ctx.accounts.handler;

    require!(product.is_active, SupplyChainError::ProductInactive);
    require!(
      product.current_owner == handler.key(),
      SupplyChainError::Unauthorized
    );

    product.current_status = String::from("Delivered");
    product.journal_entries_count += 1;

    let journal_entry = &mut ctx.accounts.journal_entry;
    journal_entry.product = product.key();
    journal_entry.owner = *handler.key;
    journal_entry.timestamp = Clock::get()?.unix_timestamp;
    journal_entry.title = title;
    journal_entry.message = message;
    journal_entry.status = String::from("Delivered");
    journal_entry.location = product.current_location.clone();
    journal_entry.entry_number = product.journal_entries_count - 1;

    Ok(())
  }

  pub fn deactivate_product(
    ctx: Context<UpdateProductStatus>,
    title: String,
    reason: String,
  ) -> Result<()> {
    msg!("Product deactivated");
    msg!("Title: {}", title);
    msg!("Reason: {}", reason);

    let product = &mut ctx.accounts.product;
    let handler &ctx.accounts.handler;

    require!(
      product.current_owner == handler.key(),
      SupplyChainError::Unauthorized
    );

    product.is_active = false;
    product.current_status = String::from("Deactivated");
    product.journal_entries_count += 1;

    let journal_entry = &mut ctx.accounts.journal_entry;
    journal_entry.product = product.key();
    journal_entry.owner = *handler.key;
    journal_entry.timestamp = Clock::get()?.unix_timestamp;
    journal_entry.title = title;
    journal_entry.message = reason;
    journal_entry.status = String::from("Deactivated");
    journal_entry.location = product.current_location.clone();
    journal_entry.entry_number = product.journal_entries_count - 1;

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

#[account]
pub struct ProductState {
  pub product_id: String,
  pub name: String,
  pub description: String,
  pub current_owner: Pubkey,
  pub current_location: String,
  pub current_status: String,
  pub created_at: i64,
  pub is_active: bool,
  pub journal_entries_count: u8,
}

#[account]
pub struct JournalEntryState {
  pub product: Pubkey,
  pub owner: Pubkey,
  pub timestamp: i64,
  pub title: String,
  pub message: String,
  pub status: String,
  pub location: String,
  pub entry_number: u8,
}

impl ProductState {
  pub const INIT_SPACE: usize =
    4 + 50 +
    4 + 100 +
    4 + 500 +
    32 +
    4 + 50 +
    4 + 100 +
    8 +
    1 +
    1;
}

impl JournalEntryState {
  pub const INIT_SPACE: usize =
    32 +
    32 +
    8 +
    4 + 100 +
    4 + 1000 +
    4 + 50 +
    4 + 100 +
    1;
}

#[error_code]
pub enum SupplyChainError {
  #[msg("You are not authorized to perform this action")]
  Unauthorized,
  #[msg("This product is no longer active in the supply chain")]
  ProductInactive
}