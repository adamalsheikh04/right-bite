import { useNavigate } from "react-router-dom";

function MealWizardPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h2>Meal Plan Wizard</h2>

      <div style={{ marginBottom: 10 }}>
        <label>Meals Per Day</label>
        <br />
        <select>
          <option value="">Select meals per day</option>
          <option value="3">3 Meals</option>
          <option value="4">4 Meals</option>
          <option value="5">5 Meals</option>
          <option value="6">6 Meals</option>
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Preferred Protein Sources</label>
        <br />
        <div>
          <input type="checkbox" /> Chicken
        </div>
        <div>
          <input type="checkbox" /> Beef
        </div>
        <div>
          <input type="checkbox" /> Fish
        </div>
        <div>
          <input type="checkbox" /> Eggs
        </div>
        <div>
          <input type="checkbox" /> Dairy
        </div>
        <div>
          <input type="checkbox" /> Legumes
        </div>
        <div>
          <input type="checkbox" /> Tofu
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Foods to Avoid</label>
        <br />
        <textarea rows="3" placeholder="Type foods to avoid" />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Cooking Effort</label>
        <br />
        <select>
          <option value="">Select cooking effort</option>
          <option value="easy">Very Easy</option>
          <option value="moderate">Moderate</option>
          <option value="any">Any</option>
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Budget Level</label>
        <br />
        <select>
          <option value="">Select budget</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Cuisine Style</label>
        <br />
        <select>
          <option value="">Select cuisine style</option>
          <option value="arabic">Arabic</option>
          <option value="western">Western</option>
          <option value="mixed">Mixed</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Variety Level</label>
        <br />
        <select>
          <option value="">Select variety level</option>
          <option value="low">Repeat meals</option>
          <option value="medium">Moderate variety</option>
          <option value="high">High variety</option>
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Extra Notes</label>
        <br />
        <textarea rows="3" placeholder="Any extra notes" />
      </div>

      <button onClick={() => navigate("/weekly-plan")}>
        Generate Weekly Plan
      </button>
    </div>
  );
}

export default MealWizardPage;