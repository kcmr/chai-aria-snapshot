export async function rejectionOf(assertion: Promise<void>): Promise<unknown> {
  try {
    await assertion;
  } catch (error) {
    return error;
  }
  throw new Error('Expected the assertion to reject.');
}
