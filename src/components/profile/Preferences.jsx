import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from 'lucide-react';

const dietaryOptions = ["vegetarian", "vegan", "gluten_free", "dairy_free"];
const notificationOptions = ["order_updates", "promotions", "new_menu"];

export default function Preferences() {
  const [prefs, setPrefs] = useState({
    default_payment: '',
    dietary_prefs: [],
    notifications: [],
    default_size: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadPrefs = async () => {
      const user = await User.me();
      if (user.preferences) {
        setPrefs(user.preferences);
      }
    };
    loadPrefs();
  }, []);

  const handleCheckboxChange = (group, value) => {
    setPrefs(prev => {
      const newValues = prev[group].includes(value)
        ? prev[group].filter(item => item !== value)
        : [...prev[group], value];
      return { ...prev, [group]: newValues };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData({ preferences: prefs });
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert('Failed to save preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-2">Default Payment Method</h3>
        <RadioGroup value={prefs.default_payment} onValueChange={(val) => setPrefs(p => ({...p, default_payment: val}))}>
          <div className="flex items-center space-x-2"><RadioGroupItem value="cash" id="cash" /><Label htmlFor="cash">Cash</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="venmo" id="venmo" /><Label htmlFor="venmo">Venmo</Label></div>
        </RadioGroup>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Dietary Preferences</h3>
        <div className="space-y-2">
          {dietaryOptions.map(opt => (
            <div key={opt} className="flex items-center space-x-2">
              <Checkbox id={`diet-${opt}`} checked={prefs.dietary_prefs?.includes(opt)} onCheckedChange={() => handleCheckboxChange('dietary_prefs', opt)} />
              <Label htmlFor={`diet-${opt}`} className="capitalize">{opt.replace('_', ' ')}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Notifications</h3>
        <div className="space-y-2">
          {notificationOptions.map(opt => (
            <div key={opt} className="flex items-center space-x-2">
              <Checkbox id={`notif-${opt}`} checked={prefs.notifications?.includes(opt)} onCheckedChange={() => handleCheckboxChange('notifications', opt)} />
              <Label htmlFor={`notif-${opt}`} className="capitalize">{opt.replace('_', ' ')}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Default Order Size</h3>
        <Select value={prefs.default_size} onValueChange={(val) => setPrefs(p => ({...p, default_size: val}))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="No preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>No preference</SelectItem>
            <SelectItem value="pint">Pint</SelectItem>
            <SelectItem value="quart">Quart</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}