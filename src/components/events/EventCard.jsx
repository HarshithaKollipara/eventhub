function EventCard({
  event,
  onEdit,
  onDelete,
  isDeleting,
  variant = 'organizer',
  onRegister,
  isRegistered,
  isRegistering,
}) {
  const isStudentView = variant === 'student'
  const registrationDeadline = event.registrationDeadline
    ? new Date(event.registrationDeadline).toLocaleString()
    : 'Not set'

  return (
    <article className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{event.title}</h2>
      {isStudentView && (
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {event.description || 'No description provided.'}
        </p>
      )}
      <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="font-medium text-slate-900">Category</dt>
          <dd>{event.category || 'Not specified'}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Venue</dt>
          <dd>{event.venue || 'Not specified'}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Date</dt>
          <dd>{event.date}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Time</dt>
          <dd>{event.time || 'Not specified'}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Maximum Participants</dt>
          <dd>{event.maxParticipants}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Registration Deadline</dt>
          <dd>{registrationDeadline}</dd>
        </div>
        {isStudentView && (
          <div>
            <dt className="font-medium text-slate-900">Organizer</dt>
            <dd>{event.organizerName || 'Not specified'}</dd>
          </div>
        )}
      </dl>
      <div className="mt-5 flex gap-3">
        {isStudentView ? (
          <button
            type="button"
            onClick={() => onRegister(event)}
            disabled={isRegistered || isRegistering}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
          >
            {isRegistered
              ? 'Already Registered'
              : isRegistering
                ? 'Registering...'
                : 'Register'}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onEdit(event.id)}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(event.id)}
              disabled={isDeleting}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        )}
      </div>
    </article>
  )
}

export default EventCard
