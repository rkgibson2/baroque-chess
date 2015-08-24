var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var svg = d3.select("#svg").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scale.ordinal()
    .domain([1, 2, 3, 4, 5, 6, 7, 8])
    .rangeRoundBands([0, width]);

var y = d3.scale.ordinal()
    .domain([1, 2, 3, 4, 5, 6, 7, 8])
    .rangeRoundBands([height, 0]);

var board = svg.append("rect")
    .attr("id", "board")
    .attr("width", width)
    .attr("height", height);

// create board
var cells = [];
for (var row = 1; row < 9; row++) {
    for (var col = 1; col < 9; col++) {
        cells.push({
            row: row,
            col: col,
            cellName: indexToCellName(col, row)
        });
    }
}

svg.selectAll(".square")
    .data(cells)
  .enter().append("rect")
    .attr("class", function(d) {
        return "square " + d.cellName + " " + ((d.row + d.col) % 2 == 0 ? "black" : "white")
    })
    .attr("x", function(d) { return x(d.col); })
    .attr("y", function(d) { return y(d.row); })
    .attr("width", x.rangeBand())
    .attr("height", y.rangeBand());

var pieceDrag = d3.behavior.drag()

pieceDrag.on("dragstart", pieceDragStart)
    .on("drag", pieceDragging)
    .on("dragend", pieceDragEnd)
    .origin(function(d) { return d; })

resetPieces()

function indexToLetter(col) {
    var cols = ["a", "b", "c", "d", "e", "f", "g", "h"];
    if (col < 1 || col > 8) {
        throw "Invalid column number " + col;
    }

    return cols[col - 1];
}

function indexToCellName(col, row) {
    return indexToLetter(col) + row;
}

function cellNameToIndex(cellName) {
    var row = +cellName[1];

    var col = 0;
    switch (cellName[0]) {
        case "a":
            col = 1;
            break;
        case "b":
            col = 2;
            break;
        case "c":
            col = 3;
            break;
        case "d":
            col = 4;
            break;
        case "e":
            col = 5;
            break;
        case "f":
            col = 6;
            break;
        case "g":
            col = 7;
            break;
        case "h":
            col = 8;
            break;
        default:
            throw "Invalid column name " + cellName[0];
    }

    return {col: col, row: row};
}

var pieceId = 0
function Piece(name, side, position) {
    this.name = name;
    this.side = side;
    this.position = position;
    this.id = pieceId++

    this.x = x(cellNameToIndex(position).col)
    this.y = y(cellNameToIndex(position).row)

    this.image = function() { return "img/" + side + "-" + name + ".png"; }
}

function pieceDragStart() {
}

function pieceDragging(d) {
    d3.select(this)
        .attr("x", d.x = d3.event.x)
        .attr("y", d.y = d3.event.y);
}

function pieceDragEnd(d) {

    // find center of image
    centerX = +d3.select(this).attr("x") + x.rangeBand() / 2;
    centerY = +d3.select(this).attr("y") + y.rangeBand() / 2;

    // TODO: handle columns and rows outside the board

    // check possible columns
    for (var col = 1 ; col < 9; col++) {
        if (x(col) <= centerX && x(col) + x.rangeBand() > centerX) {
            d3.select(this).attr("x", d.x = x(col));
            break;
        }
    }

    // check possible rows
    for (var row = 1 ; row < 9; row++) {
        if (y(row) <= centerY && y(row) + y.rangeBand() > centerY) {
            d3.select(this).attr("y", d.y = y(row));
            break;
        }
    }

    d.position = indexToCellName(col, row);
}

function resetPieces() {
    svg.selectAll(".piece").remove()
    pieces = getPieces()

    svg.selectAll(".piece")
        .data(pieces, function(d) { return d.id; })
      .enter().append("image")
        .attr("class", function(d) {
            return "piece " + d.name + " " + d.side + " " + d.position;
        })
        .attr("xlink:href", function(d) { return d.image(); })
        .attr("x", function(d) { return x(cellNameToIndex(d.position).col); })
        .attr("y", function(d) { return y(cellNameToIndex(d.position).row); })
        .attr("height", y.rangeBand())
        .attr("width", x.rangeBand())
        .on("dblclick", function(d) {
            var indexOf = pieces.indexOf(d);
            pieces.splice(indexOf, 1);
            updateBoard();
        })
        .call(pieceDrag);
}

function getPieces() {
    pieceId = 0
    return [new Piece("pincer", "white", "a2"),
            new Piece("pincer", "white", "b2"),
            new Piece("pincer", "white", "c2"),
            new Piece("pincer", "white", "d2"),
            new Piece("pincer", "white", "e2"),
            new Piece("pincer", "white", "f2"),
            new Piece("pincer", "white", "g2"),
            new Piece("pincer", "white", "h2"),
            new Piece("immobilizer", "white", "a1"),
            new Piece("leaper", "white", "b1"),
            new Piece("imitator", "white", "c1"),
            new Piece("withdrawer", "white", "d1"),
            new Piece("king", "white", "e1"),
            new Piece("imitator", "white", "f1"),
            new Piece("leaper", "white", "g1"),
            new Piece("coordinator", "white", "h1"),
            new Piece("pincer", "black", "a7"),
            new Piece("pincer", "black", "b7"),
            new Piece("pincer", "black", "c7"),
            new Piece("pincer", "black", "d7"),
            new Piece("pincer", "black", "e7"),
            new Piece("pincer", "black", "f7"),
            new Piece("pincer", "black", "g7"),
            new Piece("pincer", "black", "h7"),
            new Piece("coordinator", "black", "a8"),
            new Piece("leaper", "black", "b8"),
            new Piece("imitator", "black", "c8"),
            new Piece("king", "black", "d8"),
            new Piece("withdrawer", "black", "e8"),
            new Piece("imitator", "black", "f8"),
            new Piece("leaper", "black", "g8"),
            new Piece("immobilizer", "black", "h8")
            ];
}

function updateBoard() {
    var pieceDom = svg.selectAll(".piece")
        .data(pieces, function(d) { return d.id; });

    pieceDom.exit() .remove();

    pieceDom.enter().append("image")
        .attr("class", function(d) {
            return "piece " + d.name + " " + d.side + " " + d.position;
        })
        .attr("xlink:href", function(d) { return d.image(); })
        .attr("height", y.rangeBand())
        .attr("width", x.rangeBand())
        .on("dblclick", function(d) {
            var indexOf = pieces.indexOf(d);
            pieces = pieces.slice(indexOf, 1);
            updateBoard();
        })
        .call(pieceDrag);

    pieceDom.attr("x", function(d) { return x(cellNameToIndex(d.position).col); })
        .attr("y", function(d) { return y(cellNameToIndex(d.position).row); });
}