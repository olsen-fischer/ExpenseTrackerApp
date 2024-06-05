using ExpenseTracker.Domain;
using System.Globalization;
using System.Text;
using System.Text.Json;

public class TransactionRepository
{
    private  readonly string _filePath = "transactions.json";
    private List<Transaction> _transactions;

    public TransactionRepository()
    {
        _transactions = LoadTransactionsFromFile();
    }

    private List<Transaction> LoadTransactionsFromFile()
    {
        var transactions = new List<Transaction>();

        if (File.Exists(_filePath))
        {
            var json = File.ReadAllText(_filePath);
            transactions = JsonSerializer.Deserialize<List<Transaction>>(json);
        }

        return transactions;
    }

    private void SaveTransactionsToFile()
    {
        var json = JsonSerializer.Serialize(_transactions);
        File.WriteAllText(_filePath, json);
    }

    public IEnumerable<Transaction> GetAllTransactions()
    {
        return _transactions;
    }

    public Transaction GetTransactionById(int id)
    {
        return _transactions.FirstOrDefault(t => t.Id == id);
    }

    public void AddTransaction(Transaction transaction)
    {
        transaction.Id = _transactions.Any() ? _transactions.Max(t => t.Id) + 1 : 1;
        _transactions.Add(transaction);
        SaveTransactionsToFile();
    }

    public void UpdateTransaction(Transaction transaction)
    {
        var existingTransaction = _transactions.FirstOrDefault(t => t.Id == transaction.Id);
        if (existingTransaction != null)
        {
            existingTransaction.Description = transaction.Description;
            existingTransaction.Amount = transaction.Amount;
            existingTransaction.Category = transaction.Category;
            existingTransaction.Date = transaction.Date;
            SaveTransactionsToFile();
        }
    }

    public void DeleteTransaction(int id)
    {
        var transaction = _transactions.FirstOrDefault(t => t.Id == id);
        if (transaction != null)
        {
            _transactions.Remove(transaction);
            SaveTransactionsToFile();
        }
    }

    public string GetTransactionsAsCsv()
    {
        var csvBuilder = new StringBuilder();
        csvBuilder.AppendLine("Id,Description,Amount,Category,Date");

        foreach (var transaction in _transactions)
        {
            csvBuilder.AppendLine($"{transaction.Description},{transaction.Amount.ToString(CultureInfo.InvariantCulture)},{transaction.Category},{transaction.Date:yyyy-MM-dd}");
        }

        return csvBuilder.ToString();
    }
}
