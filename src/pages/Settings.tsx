import {
  User,
  Bell,
  Shield,
  Globe,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";

function Settings() {
  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3">
            <SettingsIcon className="text-blue-600" size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Settings
            </h1>
            <p className="text-sm text-slate-500">
              Manage your caregiver dashboard preferences
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl space-y-6">

        {/* Profile Settings */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <User className="text-blue-600" size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Profile Settings
              </h2>
              <p className="text-sm text-slate-500">
                Manage your caregiver profile
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>

              <input
                type="text"
                defaultValue="Caregiver"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email Address
              </label>

              <input
                type="email"
                defaultValue="caregiver@example.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Role
              </label>

              <select
                defaultValue="Caregiver"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option>Caregiver</option>
                <option>Healthcare Worker</option>
                <option>Family Member</option>
                <option>Administrator</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Contact Number
              </label>

              <input
                type="tel"
                placeholder="Enter contact number"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <Bell className="text-orange-600" size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Notification Settings
              </h2>

              <p className="text-sm text-slate-500">
                Choose which alerts you want to receive
              </p>
            </div>
          </div>

          <div className="space-y-4">

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-800">
                  Performance Alerts
                </p>

                <p className="text-sm text-slate-500">
                  Notify when a patient's performance shows a significant decline
                </p>
              </div>

              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 accent-blue-600"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-800">
                  Inactivity Alerts
                </p>

                <p className="text-sm text-slate-500">
                  Notify when a patient has not used the app for several days
                </p>
              </div>

              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 accent-blue-600"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-800">
                  Reminder Alerts
                </p>

                <p className="text-sm text-slate-500">
                  Notify when medication or other important reminders are missed
                </p>
              </div>

              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 accent-blue-600"
              />
            </label>

          </div>
        </section>

        {/* Language & Region */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Globe className="text-green-600" size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Language & Region
              </h2>

              <p className="text-sm text-slate-500">
                Configure language and region preferences
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Dashboard Language
              </label>

              <select
                defaultValue="English"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option>English</option>
                <option>Assamese</option>
                <option>Bengali</option>
                <option>Hindi</option>
                <option>Manipuri</option>
                <option>Mizo</option>
                <option>Nagamese</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Region
              </label>

              <select
                defaultValue="North Eastern Region"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option>North Eastern Region</option>
                <option>Assam</option>
                <option>Arunachal Pradesh</option>
                <option>Manipur</option>
                <option>Meghalaya</option>
                <option>Mizoram</option>
                <option>Nagaland</option>
                <option>Tripura</option>
                <option>Sikkim</option>
              </select>
            </div>

          </div>
        </section>

        {/* Privacy & Security */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Shield className="text-purple-600" size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Privacy & Security
              </h2>

              <p className="text-sm text-slate-500">
                Manage patient data security preferences
              </p>
            </div>
          </div>

          <div className="space-y-4">

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <p className="font-medium text-slate-800">
                  Patient Data Protection
                </p>

                <p className="text-sm text-slate-500">
                  Patient information should only be accessible to authorized caregivers
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                Enabled
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <p className="font-medium text-slate-800">
                  Secure Data Sync
                </p>

                <p className="text-sm text-slate-500">
                  Data can be synchronized securely when internet connectivity is available
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                Enabled
              </span>
            </div>

          </div>
        </section>

        {/* SIH Project Information */}
        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-blue-900">
            SIH Project
          </h2>

          <p className="text-sm leading-6 text-blue-800">
            This caregiver dashboard is designed to help caregivers and
            healthcare workers monitor patient engagement, cognitive-game
            performance, reminders, and activity trends. The system is intended
            for monitoring and support and is not a medical diagnosis tool.
          </p>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Save size={19} />
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
}

export default Settings;
