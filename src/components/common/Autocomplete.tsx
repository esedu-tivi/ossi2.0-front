import { Autocomplete as MuiAutocomplete, TextField } from "@mui/material";

export interface Option {
  id: string | number
  name: string
}

interface AutocompleteProps {
  sx?: object
  id: string
  label: string
  required?: boolean
  value: Option | null
  defaultValue?: Option
  options: Option[]
  onChange: (_event: React.SyntheticEvent, newValue: Option | null) => void
  noOptionsText?: string
}

const Autocomplete = ({ sx, id, label, required, value, defaultValue, options, onChange, noOptionsText }: AutocompleteProps) => {
  return (
    <MuiAutocomplete
      sx={sx}
      id={id}
      options={options}
      value={value}
      isOptionEqualToValue={(o, v) => typeof o === 'object' && typeof v === 'object' ? o.id === v.id : o === v}
      onChange={onChange}
      filterSelectedOptions
      getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
      defaultValue={defaultValue}
      noOptionsText={noOptionsText}
      renderInput={(params) => (
        <TextField
          {...params}
          required={required ? true : false}
          variant="outlined"
          label={label}
        />
      )}
    />
  )
}

export default Autocomplete
