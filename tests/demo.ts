import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Demo } from "../target/types/demo";
import assert from "assert";

describe("demo", () => {
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  // Configure the client to use the local cluster.

  const program = anchor.workspace.Demo as Program<Demo>;
  const userA = anchor.web3.Keypair.generate();

  it("Create counter", async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(provider.wallet.publicKey, 1e9)
    );

    const [counterPDA, counterBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode("counter"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

    await program.rpc.initialize(counterBump, {
      accounts: {
        counter: counterPDA,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });
    const result = await program.account.counter.fetch(counterPDA);
    assert(result.count === 0, `count expect to be 0, but ${result.count}`);
  });

  it("Counter + 1", async () => {
    const [counterPDA, counterBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode("counter"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

    await program.rpc.addOne({
      accounts: {
        counter: counterPDA,
        owner: provider.wallet.publicKey,
      },
    });
    const result = await program.account.counter.fetch(counterPDA);
    assert(result.count === 1, `count expect to be 1, but ${result.count}`);
  });

  it("initalize userA", async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(userA.publicKey, 1e9)
    );
    const [counterPDA, counterBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode("counter"), userA.publicKey.toBuffer()],
        program.programId
      );

    await program.rpc.initialize(counterBump, {
      accounts: {
        counter: counterPDA,
        owner: userA.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [userA],
    });
    const result = await program.account.counter.fetch(counterPDA);
    assert(
      result.count === 0,
      `userA count expect to be 0, but ${result.count}`
    );
  });

  it("UserA Counter + 1", async () => {
    const [counterPDA, counterBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode("counter"), userA.publicKey.toBuffer()],
        program.programId
      );

    await program.rpc.addOne({
      accounts: {
        counter: counterPDA,
        owner: userA.publicKey,
      },
      signers: [userA],
    });
    const result = await program.account.counter.fetch(counterPDA);
    assert(result.count === 1, `count expect to be 1, but ${result.count}`);

    const all = await program.account.counter.all();
    console.log("all", all);
  });
});
