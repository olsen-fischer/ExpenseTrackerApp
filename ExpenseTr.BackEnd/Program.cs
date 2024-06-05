using ExpenseTracker.Domain;
using Microsoft.AspNetCore.Mvc;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder =>
        {
            builder.WithOrigins("*")
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

builder.Services.AddSingleton<TransactionRepository>();

// Add Swagger services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Use Swagger middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAllOrigins");

app.UseHttpsRedirection();

app.MapGet("/transactions", (TransactionRepository repository) =>
{
    return Results.Ok(repository.GetAllTransactions());
});

app.MapGet("/transactions/{id}", (int id, TransactionRepository repository) =>
{
    var transaction = repository.GetTransactionById(id);
    return transaction != null ? Results.Ok(transaction) : Results.NotFound();
});

app.MapPost("/transactions", (TransactionRepository repository, [FromBody] Transaction transaction) =>
{
    repository.AddTransaction(transaction);
    return Results.Ok(transaction);
});

app.MapPut("/transactions/{id}", (int id, TransactionRepository repository, [FromBody] Transaction transaction) =>
{
    var existingTransaction = repository.GetTransactionById(id);
    if (existingTransaction == null)
    {
        return Results.NotFound();
    }

    repository.UpdateTransaction(transaction);
    return Results.Ok(transaction);
});

app.MapDelete("/transactions/{id}", (int id, TransactionRepository repository) =>
{
    repository.DeleteTransaction(id);
    return Results.NoContent();
});

app.MapGet("/transactions/download/csv", (TransactionRepository repository) =>
{
var csv = repository.GetTransactionsAsCsv();

if (string.IsNullOrEmpty(csv))
{
return Results.NoContent();
}

var csvBytes = Encoding.UTF8.GetBytes(csv);
return Results.File(csvBytes, "text/csv", "transactions.csv");
});

app.Run();

public partial class Program { }
