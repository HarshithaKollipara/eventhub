import { useState } from 'react'

const emptyEvent = {
  title: '',
  description: '',
  category: '',
  venue: '',
  date: '',
  time: '',
  registrationDeadline: '',
  maxParticipants: '',
}

function getFormValues(values) {
  return Object.keys(emptyEvent).reduce((formValues, key) => {
    formValues[key] = values?.[key] ?? emptyEvent[key]
    return formValues
  }, {})
}

function EventForm({ initialValues, onSubmit, submitLabel, isSubmitting, resetOnSuccess }) {
  const [formData, setFormData] = useState(() => getFormValues(initialValues))
  const [errors, setErrors] = useState({})

  function validate() {
    const validationErrors = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDate = new Date(`${formData.date}T00:00:00`)
    const eventDateTime = new Date(`${formData.date}T${formData.time || '23:59'}`)
    const deadline = new Date(formData.registrationDeadline)

    if (!formData.title.trim()) {
      validationErrors.title = 'Event title is required.'
    }

    if (!formData.date || eventDate < today) {
      validationErrors.date = 'Event date cannot be in the past.'
    }

    if (!formData.registrationDeadline || deadline >= eventDateTime) {
      validationErrors.registrationDeadline =
        'Registration deadline must be before the event date and time.'
    }

    if (Number(formData.maxParticipants) < 1) {
      validationErrors.maxParticipants = 'Maximum participants must be at least 1.'
    }

    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validate()) {
      return
    }

    const wasSaved = await onSubmit({
      ...formData,
      maxParticipants: Number(formData.maxParticipants),
    })

    if (wasSaved && resetOnSuccess) {
      handleReset()
    }
  }

  function handleReset() {
    setFormData(getFormValues(initialValues))
    setErrors({})
  }

  const fields = [
    ['title', 'Event Title', 'text'],
    ['description', 'Description', 'textarea'],
    ['category', 'Category', 'text'],
    ['venue', 'Venue', 'text'],
    ['date', 'Date', 'date'],
    ['time', 'Time', 'time'],
    ['registrationDeadline', 'Registration Deadline', 'datetime-local'],
    ['maxParticipants', 'Maximum Participants', 'number'],
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white p-6 shadow-sm">
      {fields.map(([name, label, type]) => (
        <label key={name} className="block text-sm font-medium text-slate-700">
          {label}
          {type === 'textarea' ? (
            <textarea
              name={name}
              value={formData[name]}
              onChange={handleChange}
              rows="4"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          ) : (
            <input
              name={name}
              type={type}
              value={formData[name]}
              onChange={handleChange}
              min={name === 'maxParticipants' ? '1' : undefined}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          )}
          {errors[name] && <span className="mt-1 block text-sm text-red-600">{errors[name]}</span>}
        </label>
      ))}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700"
        >
          Reset
        </button>
      </div>
    </form>
  )
}

export default EventForm
