import './Table.css'

export default function TableSquel({ columns = 5, rows = 5, withActions = true }) {
  return (
    <div className="tableWrapper">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="th center">
                <div className="skeleton-cell skeleton-header" />
              </th>
            ))}
            {withActions && <th className="th center"><div className="skeleton-cell skeleton-header" style={{ width: "60%" }} /></th>}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="tr">
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="td center">
                  <div className="skeleton-cell" />
                </td>
              ))}
              {withActions && (
                <td className="td spaceIcon skeleton-actions">
                  <div className="skeleton-icon" />
                  <div className="skeleton-icon" />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
