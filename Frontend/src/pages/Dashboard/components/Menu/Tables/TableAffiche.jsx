import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Table.css'

const PAGE_SIZE = 5;
const ROW_HEIGHT = 54;

const TableAffiche = ({ items, columns}) => {
  const [page] = useState(0);
  const visible = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const cols = columns.map((col) =>
    typeof col === "string" ? {key: col, label: col} : col
  );
  const emptyRowsCount = PAGE_SIZE - visible.length;

  return (
    <div className="tableAffWrapper">
      <table className="table">
        <thead>
          <tr>
            {cols.map((col) => (
              <th key={col.key} className="thAff center">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="emptyCell" style={{ height: `${PAGE_SIZE * ROW_HEIGHT}px` }}>
                Aucune donnée
              </td>
            </tr>
          ) : (
            <>
              {visible.map((item, i) => (
                <tr key={i} className="tr">
                  {cols.map((col) => (
                    <td key={col.key} className="tdAff center">{item[col.key]}</td>
                  ))}
                </tr>
              ))}
              {Array.from({ length: emptyRowsCount }).map((_, i) => (
                <tr key={`empty-${i}`} className="tr emptyRow">
                  <td colSpan={cols.length + 1}>&nbsp;</td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableAffiche;