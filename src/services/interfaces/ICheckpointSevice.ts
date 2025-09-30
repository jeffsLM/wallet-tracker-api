export interface ICheckpointService {
  checkAfterTransaction(accountId: string): Promise<void>;
}
