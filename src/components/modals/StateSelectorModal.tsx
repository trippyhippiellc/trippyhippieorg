"use client";

import { useState } from "react";
import { MapPin, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useStateSelector } from "@/hooks/useStateSelector";

/* src/components/modals/StateSelectorModal.tsx */

const US_STATES = [
  { code:"AL",name:"Alabama" },{ code:"AK",name:"Alaska" },{ code:"AZ",name:"Arizona" },
  { code:"AR",name:"Arkansas" },{ code:"CA",name:"California" },{ code:"CO",name:"Colorado" },
  { code:"CT",name:"Connecticut" },{ code:"DE",name:"Delaware" },{ code:"FL",name:"Florida" },
  { code:"GA",name:"Georgia" },{ code:"HI",name:"Hawaii" },{ code:"ID",name:"Idaho" },
  { code:"IL",name:"Illinois" },{ code:"IN",name:"Indiana" },{ code:"IA",name:"Iowa" },
  { code:"KS",name:"Kansas" },{ code:"KY",name:"Kentucky" },{ code:"LA",name:"Louisiana" },
  { code:"ME",name:"Maine" },{ code:"MD",name:"Maryland" },{ code:"MA",name:"Massachusetts" },
  { code:"MI",name:"Michigan" },{ code:"MN",name:"Minnesota" },{ code:"MS",name:"Mississippi" },
  { code:"MO",name:"Missouri" },{ code:"MT",name:"Montana" },{ code:"NE",name:"Nebraska" },
  { code:"NV",name:"Nevada" },{ code:"NH",name:"New Hampshire" },{ code:"NJ",name:"New Jersey" },
  { code:"NM",name:"New Mexico" },{ code:"NY",name:"New York" },{ code:"NC",name:"North Carolina" },
  { code:"ND",name:"North Dakota" },{ code:"OH",name:"Ohio" },{ code:"OK",name:"Oklahoma" },
  { code:"OR",name:"Oregon" },{ code:"PA",name:"Pennsylvania" },{ code:"RI",name:"Rhode Island" },
  { code:"SC",name:"South Carolina" },{ code:"SD",name:"South Dakota" },{ code:"TN",name:"Tennessee" },
  { code:"TX",name:"Texas" },{ code:"UT",name:"Utah" },{ code:"VT",name:"Vermont" },
  { code:"VA",name:"Virginia" },{ code:"WA",name:"Washington" },{ code:"WV",name:"West Virginia" },
  { code:"WI",name:"Wisconsin" },{ code:"WY",name:"Wyoming" },
];

interface StateSelectorModalProps {
  isOpen:  boolean;
  onClose: () => void;
}

export function StateSelectorModal({ isOpen, onClose }: StateSelectorModalProps) {
  const { selectedState, setSelectedState, isRestricted } = useStateSelector();
  const [picked, setPicked] = useState(selectedState ?? "");

  // Update picked when selectedState changes
  const state_options_value = picked || selectedState || "";

  const restricted = picked ? isRestricted(picked) : false;

  function confirm() {
    if (!state_options_value) return;
    setSelectedState(state_options_value);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Your State">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-brand bg-brand-green/5 border border-brand-green/20">
          <MapPin className="h-4 w-4 text-brand-green flex-shrink-0 mt-0.5" />
          <p className="text-sm text-brand-cream-muted">
            We use your state to show only products legal in your area, per applicable hemp laws.
          </p>
        </div>

        <select
          value={state_options_value}
          onChange={e => setPicked(e.target.value)}
          className="w-full px-4 py-3 text-sm border border-white/10 rounded-brand text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/20 appearance-none cursor-pointer"
          style={{
            backgroundColor: '#162816',
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23F5F0E8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '16px',
            paddingRight: '2.5rem',
          }}
        >
          <option value="">Select your state…</option>
          {US_STATES.map(s => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>

        {restricted && (
          <div className="flex items-start gap-3 p-3 rounded-brand bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-300 mb-0.5">Restricted State</p>
              <p className="text-xs text-brand-cream-muted">
                We currently cannot ship certain hemp products to {US_STATES.find(s => s.code === state_options_value)?.name}.
                Only compliant accessories will be available in your store view.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="primary" onClick={confirm} disabled={!state_options_value} className="flex-1">
            Confirm State
          </Button>
          {selectedState && (
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default StateSelectorModal;
