import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { Solog } from '../target/types/solog';
import assert from 'assert';

describe('Supply Chain Tracking', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Solog as Program<Solog>;
  const wallet = provider.wallet as anchor.Wallet;

  let productId: string;
  const productName = "Test Product";
  const productDescription = "This is a test product for the supply chain";
  const initialNotes = "Initial product registration in the supply chain";
  let productPDA: PublicKey;
  const newOwnerKeypair = Keypair.generate();

  beforeEach(async () => {
    productId = "PROD-" + Math.floor(Math.random() * 1000000).toString();

    const signature = await provider.connection.requestAirdrop(
      newOwnerKeypair.publicKey,
      1000000000
    );
    await provider.connection.confirmTransaction(signature);

    const [productAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("product"), Buffer.from(productId)],
      program.programId
    );
    productPDA = productAddress;
  });

  it('Creates a new product with initial journal entry', async () => {
    const [journalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([0])],
      program.programId
    );

    await program.methods
      .createProduct(
        productId,
        productName,
        productDescription,
        initialNotes
      )
      .accounts({
        product: productPDA,
        journalEntry: journalAddress,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const productAccount = await program.account.productState.fetch(productPDA);
    assert.equal(productAccount.productId, productId);
    assert.equal(productAccount.name, productName);
    assert.equal(productAccount.description, productDescription);
    assert.equal(productAccount.currentStatus, "Created");
    assert.equal(productAccount.currentLocation, "Origin");
    assert.equal(productAccount.isActive, true);
    assert.equal(productAccount.journalEntriesCount, 1);

    const journalAccount = await program.account.journalEntryState.fetch(journalAddress);
    assert.equal(journalAccount.title, "Product Registration");
    assert.equal(journalAccount.message, initialNotes);
    assert.equal(journalAccount.status, "Created");
    assert.equal(journalAccount.location, "Origin");
    assert.equal(journalAccount.entryNumber, 0);
  });

  it('Adds a journal entry to update product status', async () => {
    const [initialJournalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([0])],
      program.programId
    );

    await program.methods
      .createProduct(
        productId,
        productName,
        productDescription,
        initialNotes
      )
      .accounts({
        product: productPDA,
        journalEntry: initialJournalAddress,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [journalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([1])],
      program.programId
    );

    const entryTitle = "Status Update";
    const entryMessage = "Product has passed quality control";
    const newStatus = "Quality Checked";
    const newLocation = "Warehouse A";

    await program.methods
      .addJournalEntry(
        entryTitle,
        entryMessage,
        newStatus,
        newLocation
      )
      .accounts({
        product: productPDA,
        journalEntry: journalAddress,
        handler: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const productAccount = await program.account.productState.fetch(productPDA);
    assert.equal(productAccount.currentStatus, newStatus);
    assert.equal(productAccount.currentLocation, newLocation);
    assert.equal(productAccount.journalEntriesCount, 2);

    const journalAccount = await program.account.journalEntryState.fetch(journalAddress);
    assert.equal(journalAccount.title, entryTitle);
    assert.equal(journalAccount.message, entryMessage);
    assert.equal(journalAccount.status, newStatus);
    assert.equal(journalAccount.location, newLocation);
    assert.equal(journalAccount.entryNumber, 1);
  });

  it('Transfers product ownership to a new owner', async () => {
    const [initialJournalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([0])],
      program.programId
    );

    await program.methods
      .createProduct(
        productId,
        productName,
        productDescription,
        initialNotes
      )
      .accounts({
        product: productPDA,
        journalEntry: initialJournalAddress,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [journalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([1])],
      program.programId
    );

    const transferTitle = "Ownership Transfer";
    const transferMessage = "Product transferred to new owner";
    const transferLocation = "Distribution Center";

    await program.methods
      .transferProduct(
        transferTitle,
        transferMessage,
        transferLocation
      )
      .accounts({
        product: productPDA,
        journalEntry: journalAddress,
        currentOwner: wallet.publicKey,
        newOwner: newOwnerKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const productAccount = await program.account.productState.fetch(productPDA);
    assert.equal(productAccount.currentOwner.toString(), newOwnerKeypair.publicKey.toString());
    assert.equal(productAccount.currentStatus, "Transferred");
    assert.equal(productAccount.currentLocation, transferLocation);
    assert.equal(productAccount.journalEntriesCount, 2);

    const journalAccount = await program.account.journalEntryState.fetch(journalAddress);
    assert.equal(journalAccount.title, transferTitle);
    assert.equal(journalAccount.message, transferMessage);
    assert.equal(journalAccount.status, "Transferred");
    assert.equal(journalAccount.location, transferLocation);
  });

  it('Marks product as delivered (by new owner)', async () => {
    const [initialJournalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([0])],
      program.programId
    );

    await program.methods
      .createProduct(
        productId,
        productName,
        productDescription,
        initialNotes
      )
      .accounts({
        product: productPDA,
        journalEntry: initialJournalAddress,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [transferJournalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([1])],
      program.programId
    );

    await program.methods
      .transferProduct(
        "Transfer",
        "Transfer to new owner",
        "Warehouse"
      )
      .accounts({
        product: productPDA,
        journalEntry: transferJournalAddress,
        currentOwner: wallet.publicKey,
        newOwner: newOwnerKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [deliveryJournalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([2])],
      program.programId
    );

    const deliveryTitle = "Product Delivered";
    const deliveryMessage = "Product successfully delivered to customer";

    await program.methods
      .markDelivered(
        deliveryTitle,
        deliveryMessage
      )
      .accounts({
        product: productPDA,
        journalEntry: deliveryJournalAddress,
        handler: newOwnerKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([newOwnerKeypair])
      .rpc();

    const productAccount = await program.account.productState.fetch(productPDA);
    assert.equal(productAccount.currentStatus, "Delivered");
    assert.equal(productAccount.journalEntriesCount, 3);

    const journalAccount = await program.account.journalEntryState.fetch(deliveryJournalAddress);
    assert.equal(journalAccount.title, deliveryTitle);
    assert.equal(journalAccount.message, deliveryMessage);
    assert.equal(journalAccount.status, "Delivered");
  });

  it('Deactivates a product (by owner)', async () => {
    const [initialJournalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([0])],
      program.programId
    );

    await program.methods
      .createProduct(
        productId,
        productName,
        productDescription,
        initialNotes
      )
      .accounts({
        product: productPDA,
        journalEntry: initialJournalAddress,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [transferJournalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([1])],
      program.programId
    );

    await program.methods
      .transferProduct(
        "Transfer",
        "Transfer to new owner",
        "Warehouse"
      )
      .accounts({
        product: productPDA,
        journalEntry: transferJournalAddress,
        currentOwner: wallet.publicKey,
        newOwner: newOwnerKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [deactivateJournalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([2])],
      program.programId
    );

    const deactivateTitle = "Product Lifecycle Complete";
    const deactivateReason = "Product has completed its lifecycle in the supply chain";

    await program.methods
      .deactivateProduct(
        deactivateTitle,
        deactivateReason
      )
      .accounts({
        product: productPDA,
        journalEntry: deactivateJournalAddress,
        handler: newOwnerKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([newOwnerKeypair])
      .rpc();

    const productAccount = await program.account.productState.fetch(productPDA);
    assert.equal(productAccount.isActive, false);
    assert.equal(productAccount.currentStatus, "Deactivated");
    assert.equal(productAccount.journalEntriesCount, 3);

    const journalAccount = await program.account.journalEntryState.fetch(deactivateJournalAddress);
    assert.equal(journalAccount.title, deactivateTitle);
    assert.equal(journalAccount.message, deactivateReason);
    assert.equal(journalAccount.status, "Deactivated");
  });

  it('Prevents unauthorized users from adding journal entries', async () => {
    const [initialJournalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([0])],
      program.programId
    );

    await program.methods
      .createProduct(
        productId,
        productName,
        productDescription,
        initialNotes
      )
      .accounts({
        product: productPDA,
        journalEntry: initialJournalAddress,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const unauthorizedUser = Keypair.generate();
    const signature = await provider.connection.requestAirdrop(
      unauthorizedUser.publicKey,
      1000000000
    );
    await provider.connection.confirmTransaction(signature);

    const [journalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([1])],
      program.programId
    );

    try {
      await program.methods
        .addJournalEntry(
          "Unauthorized Update",
          "This should fail",
          "Tampered",
          "Unknown"
        )
        .accounts({
          product: productPDA,
          journalEntry: journalAddress,
          handler: unauthorizedUser.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([unauthorizedUser])
        .rpc();
      assert.fail("Transaction should have failed with unauthorized error");
    } catch (error: any) {
      const errorMessage = error.toString();
      assert(
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("Unauthorized"),
        "Error should contain 'unauthorized'"
      );
    }
  });

  it('Prevents actions on inactive products', async () => {
    const [initialJournalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([0])],
      program.programId
    );

    await program.methods
      .createProduct(
        productId,
        productName,
        productDescription,
        initialNotes
      )
      .accounts({
        product: productPDA,
        journalEntry: initialJournalAddress,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [transferJournalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([1])],
      program.programId
    );

    await program.methods
      .transferProduct(
        "Transfer",
        "Transfer to new owner",
        "Warehouse"
      )
      .accounts({
        product: productPDA,
        journalEntry: transferJournalAddress,
        currentOwner: wallet.publicKey,
        newOwner: newOwnerKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [deactivateJournalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([2])],
      program.programId
    );

    await program.methods
      .deactivateProduct(
        "Deactivate",
        "Deactivating product"
      )
      .accounts({
        product: productPDA,
        journalEntry: deactivateJournalAddress,
        handler: newOwnerKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([newOwnerKeypair])
      .rpc();

    const [journalAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([3])],
      program.programId
    );

    try {
      await program.methods
        .addJournalEntry(
          "Update to Inactive Product",
          "This should fail",
          "Attempted Update",
          "Nowhere"
        )
        .accounts({
          product: productPDA,
          journalEntry: journalAddress,
          handler: newOwnerKeypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([newOwnerKeypair])
        .rpc();
      assert.fail("Transaction should have failed with inactive product error");
    } catch (error: any) {
      const errorMessage = error.toString().toLowerCase();
      assert(
        errorMessage.includes("inactive"),
        "Error should contain 'inactive'"
      );
    }
  });
});

