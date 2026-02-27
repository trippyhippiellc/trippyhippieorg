"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

/* US states for address form */
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS",
  "KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY",
  "NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

export interface AddressData {
  full_name: string;
  line1:     string;
  line2:     string;
  city:      string;
  state:     string;
  zip:       string;
  phone:     string;
}

interface AddressFormProps {
  value:    AddressData;
  onChange: (data: AddressData) => void;
}

export function AddressForm({ value, onChange }: AddressFormProps) {
  function set(field: keyof AddressData, val: string) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div className="space-y-4">
      <Input
        label="Full Name"
        value={value.full_name}
        onChange={e => set("full_name", e.target.value)}
        placeholder="Jane Smith"
        required
        autoComplete="name"
      />
      <Input
        label="Address Line 1"
        value={value.line1}
        onChange={e => set("line1", e.target.value)}
        placeholder="123 Main St"
        required
        autoComplete="address-line1"
      />
      <Input
        label="Address Line 2 (optional)"
        value={value.line2}
        onChange={e => set("line2", e.target.value)}
        placeholder="Apt 4B, Suite 200…"
        autoComplete="address-line2"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          value={value.city}
          onChange={e => set("city", e.target.value)}
          placeholder="San Antonio"
          required
          autoComplete="address-level2"
        />
        <Select
          label="State"
          value={value.state}
          onChange={e => set("state", e.target.value)}
          placeholder="Select…"
          required
        >
          {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="ZIP Code"
          value={value.zip}
          onChange={e => set("zip", e.target.value)}
          placeholder="78015"
          required
          autoComplete="postal-code"
          maxLength={10}
        />
        <Input
          label="Phone"
          type="tel"
          value={value.phone}
          onChange={e => set("phone", e.target.value)}
          placeholder="+1 (555) 000-0000"
          required
          autoComplete="tel"
        />
      </div>
    </div>
  );
}

export default AddressForm;
