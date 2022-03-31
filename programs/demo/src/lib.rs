use anchor_lang::prelude::*;

declare_id!("GpWV9hFHTuceRQm4qnSnBLLf4LPdaeEEzxt7jjnNN5CA");

#[program]
pub mod demo {

    use super::*;
    pub fn initialize(ctx: Context<Initialize>, counter_bump: u8) -> ProgramResult {
        ctx.accounts.counter.count = 0;
        ctx.accounts.counter.bump = counter_bump;
        Ok(())
    }

    pub fn add_one(ctx: Context<AddOne>) -> ProgramResult {
        ctx.accounts.counter.count += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = owner, space = 8 + 1 + 1, seeds = [b"counter", owner.key().as_ref()], bump)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct AddOne<'info> {
    #[account(mut, seeds = [b"counter", owner.key().as_ref()], bump = counter.bump)]
    pub counter: Account<'info, Counter>,
    pub owner: Signer<'info>,
}

#[account]
pub struct Counter {
    count: u8,
    bump: u8
}