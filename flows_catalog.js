// Catalogo de flujos por TAG/Equipo extraido de flujos.xlsx
// Cada TAG identifica un analizador y lista solo los flujos asociados a ese equipo.
// Editar este archivo es la forma mas rapida de actualizar el catalogo sin depender de Python.

module.exports = {
  tags: [
    { key: "3811-az-601", display: "3811-AZ-601", equipment: "COURIER MOLIBDENO" },
    { key: "3221-az-012", display: "3221-AZ-012", equipment: "COURIER ALIMENTACION" },
    { key: "3311-az-031", display: "3311-AZ-031", equipment: "COURIER RELAVES" },
    { key: "3311-az-012", display: "3311-AZ-012", equipment: "COURIER CONCENTRADOS" },
    { key: "3511-a-002",  display: "3511-AZ-002", equipment: "COURIER REMOLIENDA" },
    { key: "3221-az-011", display: "3221-AZ-011", equipment: "PSI ALIMENTACION" },
    { key: "3511-az-004", display: "3511-AZ-004", equipment: "PSI REMOLIENDA" }
  ],
  flows: {
    "3811-az-601": [
      "Concentrado Colectivo",
      "Concentrado pre primario",
      "Colas primaria  Fila 1",
      "Colas primaria Fila 2",
      "Concentrado primario Fila 1",
      "Concentrado primario Fila 2",
      "concentrado 1° limpieza",
      "concentrado 2° Limpieza",
      "Concentrado 3° limpieza",
      "Concentrado Final Moly"
    ],
    "3221-az-012": [
      "Alimentacion Fila 1",
      "Alimentacion fila 2",
      "Alimentacion Fila 3"
    ],
    "3311-az-031": [
      "Relave Scavenger",
      "Relave Fila 3",
      "Relave Fila 2",
      "Relave Fila 1"
    ],
    "3311-az-012": [
      "concentrado 1° limpieza",
      "concentrado Scavenger",
      "Relave 1° limpieza",
      "Concentrado Rougher Fila 1",
      "Concentrado Rougher Fila 2",
      "Concentrado Rougher fila 3"
    ],
    "3511-a-002": [
      "concentrado Celda n° 3",
      "concentrado Celda n° 2",
      "concentrado Celda n° 4",
      "concentrado final Bulk",
      "concentrado Celda n° 1",
      "concentrado Alta Ley",
      "concentrado Celda n° 5",
      "concentrado Celda n° 6"
    ],
    "3221-az-011": [
      "Linea 1",
      "Linea 2",
      "Linea 3"
    ],
    "3511-az-004": [
      "Alta ley",
      "Bulk"
    ]
  }
};
