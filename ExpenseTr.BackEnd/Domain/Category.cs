using System.Text.Json.Serialization;
namespace ExpenseTracker.Domain
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum Category
    {
        Grocery,
        Entertainment,
        HealthCare,
        Housing
    }
}
