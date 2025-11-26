export const customDropdown = {
  control: (base, state) => ({
    ...base,
    width: '100%',
    padding: '5px',
    border: '1.25px solid #FFBABA',
    borderRadius: '8px',
    fontSize: '14px',
    boxShadow: state.isFocused ? '0 0 0 1px #FFBABA' : 'none',
    '&:hover': {
      borderColor: '#FFBABA',
    },
  }),
  menu: (base) => ({
    ...base,
    top: '40px',
    border: '1.5px solid #D3D3D3',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    padding: '4px 20px',
    fontSize: '12px',
    backgroundColor: isSelected ? '#1967D2' : isFocused ? '#1967D2' : 'white',
    color: isSelected ? 'white' : isFocused ? 'white' : '#6B7280',
    '&:hover': {
      backgroundColor: '#1967D2',
      color: 'white',
    },
  }),
};

export const customDropdown_2 = {
  control: (base, state) => ({
    ...base,
    width: '100%',
    padding: '5px',
    border: '1.25px solid #FFBABA',
    borderRadius: '8px',
    fontSize: '14px',
    boxShadow: state.isFocused ? '0 0 0 1px #FFBABA' : 'none',
    '&:hover': {
      borderColor: '#FFBABA',
    },
  }),
  menu: (base) => ({
    ...base,
    top: '40px',
    border: '1.5px solid #D3D3D3',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  }),
  option: (base) => ({
    ...base,
    padding: '4px 20px',
    fontSize: '12px',
  }),
};
