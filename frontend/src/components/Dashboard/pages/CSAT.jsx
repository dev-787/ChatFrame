import './CSAT.scss';

const REVIEWS = [
  { name:'Priya S.', rating:5, text:'Very fast and helpful support!',    type:'positive' },
  { name:'Tom B.',   rating:4, text:'Good experience overall.',           type:'positive' },
  { name:'James R.', rating:2, text:'Took too long to get a response.',   type:'negative' },
  { name:'Mia C.',   rating:5, text:'AI solved my issue instantly.',      type:'positive' },
];

const CSAT = () => (
  <div className="db-page csat">
    <div className="db-page__header">
      <h1 className="db-page__title">CSAT / Feedback</h1>
      <p className="db-page__sub">Customer satisfaction tracking and feedback management.</p>
    </div>
    <div className="stats-grid" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
      <div className="stat-card">
        <div className="stat-card__label">Average Rating</div>
        <div className="stat-card__value">4.8 ★</div>
        <span className="badge badge--green">Excellent</span>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Total Responses</div>
        <div className="stat-card__value">1,284</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Negative Flags</div>
        <div className="stat-card__value">12</div>
        <span className="badge badge--red">Needs attention</span>
      </div>
    </div>
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {REVIEWS.map((r,i) => (
        <div key={i} className={`db-card csat__review ${r.type === 'negative' ? 'csat__review--negative' : ''}`}>
          <div className="csat__review-header">
            <div className="csat__review-name">{r.name}</div>
            <div className="csat__stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
          </div>
          <p className="csat__review-text">"{r.text}"</p>
        </div>
      ))}
    </div>
  </div>
);

export default CSAT;