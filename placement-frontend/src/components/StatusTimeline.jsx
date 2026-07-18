import React from 'react';

// Shows a horizontal progress timeline for an application's status.
// Rejected is shown as a distinct broken-off branch rather than forcing it onto the happy path.
const STEPS = ['PENDING', 'SHORTLISTED', 'SELECTED', 'PLACED'];

const StatusTimeline = ({ status }) => {
  if (status === 'REJECTED') {
    return (
      <div className="d-flex align-items-center text-danger small">
        <i className="bi bi-x-circle-fill me-2"></i>
        Application not selected
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="d-flex align-items-center">
      {STEPS.map((step, index) => {
        const reached = index <= currentIndex;
        const isLast = index === STEPS.length - 1;
        return (
          <React.Fragment key={step}>
            <div className="d-flex flex-column align-items-center" style={{ minWidth: 90 }}>
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center ${reached ? 'bg-success text-white' : 'bg-light text-muted border'}`}
                style={{ width: 28, height: 28, fontSize: '0.8rem' }}
              >
                {reached ? <i className="bi bi-check"></i> : index + 1}
              </div>
              <span className={`small mt-1 text-center ${reached ? 'text-success fw-medium' : 'text-muted'}`}>
                {step === 'SELECTED' ? 'Offer' : step.charAt(0) + step.slice(1).toLowerCase()}
              </span>
            </div>
            {!isLast && (
              <div
                className={`flex-grow-1 ${index < currentIndex ? 'bg-success' : 'bg-light border-top'}`}
                style={{ height: 2, marginBottom: 18 }}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
