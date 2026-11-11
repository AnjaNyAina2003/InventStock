import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faPen, faTrash, faFileExport } from "@fortawesome/free-solid-svg-icons";
import '../Tables/Table.css'

const PAGE_SIZE = 5;
const ROW_HEIGHT = 54;

const TableCommandes = ({ items, columns, onEdit, onDelete, onExport }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const visible = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const cols = columns.map((col) =>
    typeof col === "string" ? {key: col, label: col} : col
  );
  const emptyRowsCount = PAGE_SIZE - visible.length;

  return (
    <div className="tableWrapper">
      <table className="table">
        <thead>
          <tr>
            {cols.map((col) => (
              <th key={col.key} className="th center">{col.label}</th>
            ))}
            <th className="th center">Actions</th>
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
                    <td key={col.key} className="td center">{item[col.key]}</td>
                  ))}
                  <td className="td spaceIcon">
                    <button onClick={() => onEdit?.(item)} className="iconBtn updt" title="Modifier">
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button onClick={() => onDelete?.(item)} className="iconBtnDanger del" title="Supprimer">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <button onClick={() => onExport?.(item)} className="iconBtn exp" title="Exporter cette commande">
                      <FontAwesomeIcon icon={faFileExport} />
                    </button>
                  </td>
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

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="pageBtn"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span className="pageInfo">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="pageBtn"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TableCommandes;
