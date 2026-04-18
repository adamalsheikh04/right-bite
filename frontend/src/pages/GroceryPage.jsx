import { useNavigate } from "react-router-dom";

function GroceryPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h2>Grocery List</h2>

      <div style={{ marginBottom: 10 }}>
        <label>
          <input type="checkbox" /> Chicken breast
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          <input type="checkbox" /> Rice
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          <input type="checkbox" /> Eggs
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          <input type="checkbox" /> Greek yogurt
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          <input type="checkbox" /> Bananas
        </label>
      </div>

      <div style={{ marginBottom: 15 }}>
        <input type="text" placeholder="Add grocery item" />
        <button style={{ marginLeft: 10 }}>Add</button>
      </div>

      <button onClick={() => navigate("/weekly-plan")}>
        Back to Weekly Plan
      </button>

      <br /><br />

      <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default GroceryPage;