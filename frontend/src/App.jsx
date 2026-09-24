import { useEffect, useMemo, useState } from "react";
import "./App.css";

const FACTORS = {
  car: { name: "Car", unit: "km", factor: 0.20, category: "Transport", icon: "🚗" },
  bus: { name: "Bus", unit: "km", factor: 0.08, category: "Transport", icon: "🚌" },
  flight: { name: "Flight", unit: "km", factor: 0.25, category: "Transport", icon: "✈️" },
  electricity: { name: "Electricity", unit: "kWh", factor: 0.80, category: "Electricity", icon: "⚡" },
  vegMeal: { name: "Veg Meal", unit: "meal", factor: 0.5, category: "Food", icon: "🥗" },
  nonVegMeal: { name: "Non-Veg Meal", unit: "meal", factor: 2.0, category: "Food", icon: "🍗" }
};

function getMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekKey(date = new Date()) {
  return getMonday(date).toISOString().split("T")[0];
}

function App() {
  const [activities, setActivities] = useState(() => {
    return JSON.parse(localStorage.getItem("planetpulseActivities")) || [];
  });

  const [target, setTarget] = useState(() => {
    return Number(localStorage.getItem("planetpulseTarget")) || 50;
  });

  const [activityType, setActivityType] = useState("car");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [filterType, setFilterType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "planetpulseActivities",
      JSON.stringify(activities)
    );
  }, [activities]);

  useEffect(() => {
    localStorage.setItem("planetpulseTarget", target);
  }, [target]);

  const currentWeek = getWeekKey();

  const weekActivities = useMemo(() => {
    return activities.filter((item) => {
      return getWeekKey(new Date(item.date)) === currentWeek;
    });
  }, [activities, currentWeek]);

  const totalCO2 = weekActivities.reduce(
    (sum, item) => sum + item.co2,
    0
  );

  const progress = target > 0 ? Math.min((totalCO2 / target) * 100, 100) : 0;
  const exceeded = totalCO2 > target;

  const categoryData = {
    Transport: 0,
    Electricity: 0,
    Food: 0
  };

  weekActivities.forEach((item) => {
    categoryData[item.category] += item.co2;
  });

  const filteredActivities = activities.filter((item) => {
    const typeMatch =
      filterType === "all" || item.type === filterType;

    const fromMatch =
      !fromDate || item.date >= fromDate;

    const toMatch =
      !toDate || item.date <= toDate;

    return typeMatch && fromMatch && toMatch;
  });

  function addActivity(e) {
    e.preventDefault();

    const value = Number(quantity);

    if (!value || value <= 0) {
      setMessage("⚠️ Please enter a valid quantity.");
      return;
    }

    // Decision Point 2: absurd input
    if (
      (activityType === "car" ||
        activityType === "bus" ||
        activityType === "flight") &&
      value > 10000
    ) {
      setMessage(
        "⚠️ This distance looks unusually high. Please enter a realistic value (maximum 10,000 km)."
      );
      return;
    }

    if (activityType === "electricity" && value > 10000) {
      setMessage(
        "⚠️ Electricity usage looks unusually high. Please enter a realistic value."
      );
      return;
    }

    const info = FACTORS[activityType];
    const co2 = value * info.factor;

    const newActivity = {
      id: Date.now(),
      type: activityType,
      typeName: info.name,
      category: info.category,
      icon: info.icon,
      quantity: value,
      unit: info.unit,
      co2: Number(co2.toFixed(2)),
      date
    };

    setActivities((prev) => [newActivity, ...prev]);
    setQuantity("");
    setMessage(
      `✅ Activity added! ${value} ${info.unit} = ${co2.toFixed(2)} kg CO₂`
    );
  }

  function deleteActivity(id) {
    setActivities((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  function changeTarget(e) {
    const value = Number(e.target.value);

    if (value > 0) {
      setTarget(value);
    }
  }

  function clearFilters() {
    setFilterType("all");
    setFromDate("");
    setToDate("");
  }

  return (
    <div className="app">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">🌱</div>
          <div>
            <h2>PlanetPulse</h2>
            <span>Carbon Footprint Tracker</span>
          </div>
        </div>

        <div className="nav-links">
          <a href="#dashboard">Dashboard</a>
          <a href="#log">Log Activity</a>
          <a href="#history">History</a>
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="hero" id="dashboard">
          <div>
            <p className="eyebrow">YOUR CLIMATE IMPACT</p>
            <h1>Make every choice<br />count for the planet.</h1>
            <p className="hero-text">
              Track your daily activities, understand your carbon footprint,
              and make more sustainable choices.
            </p>
          </div>

          <div className="hero-card">
            <span>This week's footprint</span>
            <strong>{totalCO2.toFixed(2)}</strong>
            <small>kg CO₂</small>
          </div>
        </section>

        {/* STATS */}
        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon green">🌍</div>
            <div>
              <span>Total this week</span>
              <h3>{totalCO2.toFixed(2)} kg</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">🎯</div>
            <div>
              <span>Weekly target</span>
              <h3>{target.toFixed(0)} kg</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">📊</div>
            <div>
              <span>Target used</span>
              <h3>{((totalCO2 / target) * 100).toFixed(1)}%</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">📝</div>
            <div>
              <span>Activities</span>
              <h3>{weekActivities.length}</h3>
            </div>
          </div>
        </section>

        {/* TARGET + CATEGORY */}
        <section className="grid-two">
          <div className="card">
            <div className="card-heading">
              <div>
                <span className="label">WEEKLY TARGET</span>
                <h2>Your progress</h2>
              </div>
              <span className="week-badge">MON – SUN</span>
            </div>

            <div className="progress-info">
              <div>
                <strong>{totalCO2.toFixed(1)} kg</strong>
                <span> of {target} kg</span>
              </div>
              <strong>{((totalCO2 / target) * 100).toFixed(1)}%</strong>
            </div>

            <div className="progress-bar">
              <div
                className={exceeded ? "progress danger" : "progress"}
                style={{
                  width: `${Math.min(
                    (totalCO2 / target) * 100,
                    100
                  )}%`
                }}
              ></div>
            </div>

            {exceeded ? (
              <div className="alert danger-alert">
                <span>⚠️</span>
                <div>
                  <strong>Weekly target exceeded</strong>
                  <p>
                    You are {(totalCO2 - target).toFixed(1)} kg above your
                    target. Try lower-carbon choices for the rest of the week.
                  </p>
                </div>
              </div>
            ) : (
              <div className="alert success-alert">
                <span>🌿</span>
                <div>
                  <strong>You're within your target!</strong>
                  <p>
                    {(target - totalCO2).toFixed(1)} kg CO₂ remaining this week.
                  </p>
                </div>
              </div>
            )}

            <div className="target-setting">
              <label>Set weekly target (kg CO₂)</label>
              <div className="target-input">
                <input
                  type="number"
                  min="1"
                  value={target}
                  onChange={changeTarget}
                />
                <span>kg</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-heading">
              <div>
                <span className="label">BREAKDOWN</span>
                <h2>Carbon by category</h2>
              </div>
            </div>

            <div className="category-list">
              <Category
                icon="🚗"
                name="Transport"
                value={categoryData.Transport}
                total={totalCO2}
              />

              <Category
                icon="⚡"
                name="Electricity"
                value={categoryData.Electricity}
                total={totalCO2}
              />

              <Category
                icon="🍽️"
                name="Food"
                value={categoryData.Food}
                total={totalCO2}
              />
            </div>
          </div>
        </section>

        {/* LOG ACTIVITY */}
        <section className="card log-card" id="log">
          <div className="section-title">
            <div>
              <span className="label">TRACK YOUR ACTIVITY</span>
              <h2>Log a new activity</h2>
            </div>
            <span className="required">All fields required</span>
          </div>

          <form onSubmit={addActivity} className="activity-form">
            <div className="form-group">
              <label>Activity type</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
              >
                {Object.entries(FACTORS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.icon} {value.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Quantity ({FACTORS[activityType].unit})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={`Enter ${FACTORS[activityType].unit}`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <button className="primary-btn" type="submit">
              + Add Activity
            </button>
          </form>

          {message && (
            <div className="message">
              {message}
            </div>
          )}

          <div className="factor-note">
            <span>💡</span>
            <p>
              {FACTORS[activityType].name}:{" "}
              <strong>{FACTORS[activityType].factor} kg CO₂</strong> per{" "}
              {FACTORS[activityType].unit}
            </p>
          </div>
        </section>

        {/* HISTORY */}
        <section className="card history-card" id="history">
          <div className="section-title">
            <div>
              <span className="label">ACTIVITY HISTORY</span>
              <h2>Your logged activities</h2>
            </div>
            <span className="history-count">
              {filteredActivities.length} records
            </span>
          </div>

          {/* FILTERS */}
          <div className="filters">
            <div>
              <label>Activity</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All activities</option>
                {Object.entries(FACTORS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>From date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label>To date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <button
              className="clear-btn"
              onClick={clearFilters}
              type="button"
            >
              Clear
            </button>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="empty">
              <div>🌱</div>
              <h3>No activities found</h3>
              <p>Add an activity or change your filters.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>CO₂</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredActivities.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="activity-name">
                          <span className="activity-icon">
                            {item.icon}
                          </span>
                          <strong>{item.typeName}</strong>
                        </div>
                      </td>
                      <td>{item.category}</td>
                      <td>
                        {item.quantity} {item.unit}
                      </td>
                      <td>
                        <strong>{item.co2.toFixed(2)} kg</strong>
                      </td>
                      <td>{item.date}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => deleteActivity(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer>
        <strong>🌱 PlanetPulse</strong>
        <span>Track less. Live greener.</span>
      </footer>
    </div>
  );
}

function Category({ icon, name, value, total }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="category">
      <div className="category-top">
        <div className="category-name">
          <span>{icon}</span>
          <strong>{name}</strong>
        </div>

        <strong>{value.toFixed(2)} kg</strong>
      </div>

      <div className="category-bar">
        <div
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <small>{percentage.toFixed(1)}% of weekly footprint</small>
    </div>
  );
}

export default App;