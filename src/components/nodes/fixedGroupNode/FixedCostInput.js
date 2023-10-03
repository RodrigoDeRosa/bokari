const FixedCostInput = ({ labelInput, valueInput, onInputChange, onAdd }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (labelInput && valueInput) {
      onAdd();
    }
  };

  return (
    <div>
      <label>Add Fixed Cost:</label>
      <form onSubmit={handleSubmit} className="input-group">
        <input
          name="labelInput"
          value={labelInput}
          placeholder="Name"
          onChange={onInputChange}
          autoComplete="off"
          required
        />
        <input
          name="valueInput"
          type="number"
          value={valueInput}
          placeholder="Value"
          onChange={onInputChange}
          autoComplete="off"
          required
        />
        <button type="submit" className="icon-button">
          <i className="fa fa-plus"></i>
        </button>
      </form>
    </div>
  );
};

export default FixedCostInput;

