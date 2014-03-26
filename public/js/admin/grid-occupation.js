define(["jquery"],

    function ($) {
        var gridEl = $("#admin .admin-dashboard-instances");
        var modulesInstances = [];
        var size = {
            "columns": 1,
            "rows": 1
        }
        var gridMatrix;
        var dropCallback;

        var computeGrid = function () {
            gridMatrix = [];
            for (var c = 0; c < size["columns"]; c++) {
                var col = [];
                for (var l = 0; l < size["rows"]; l++) {
                    col.push(0);
                }
                gridMatrix.push(col);
            }

            modulesInstances.filter(function (mod) {
                return !mod["dock"];
            }).forEach(function (mod) {
                for (var x = 0; x < mod["size"]["w"]; x++) {
                    var matrixX = mod["position"]["x"] - 1 + x;
                    if(matrixX < gridMatrix.length) {
                        for (var y = 0; y < mod["size"]["h"]; y++) {
                            var matrixY = mod["position"]["y"] - 1 + y;
                            if(matrixY < gridMatrix[matrixX].length){
                                gridMatrix[matrixX][matrixY] = 1;
                            }
                        }
                    }
                }
            });

            displayEmptyCells();
        };

        var displayEmptyCells = function () {
            // clean empty cells
            var emptyCells = gridEl.find(".empty-cell-inner");
            emptyCells.unbind("dragover");
            emptyCells.unbind("dragleave");
            emptyCells.unbind("drop");
            emptyCells.remove();

            // display empty cells
            for (var x = 0; x < size["columns"]; x++) {
                for (var y = 0; y < size["rows"]; y++) {
                    if (!gridMatrix || gridMatrix[x][y] === 0) {
                        var emptyCell = $("<div/>", {
                            "class": "empty-cell"
                        });

                        emptyCell.css("grid-column", String(x + 1));
                        emptyCell.css("grid-row", String(y + 1));

                        emptyCell.html($("<div/>", {
                            "class": "empty-cell-inner",
                            "id": "cell-" + String(x + 1) + String(y + 1),
                            "data-x": String(x + 1),
                            "data-y": String(y + 1)
                        }));

                        gridEl.append(emptyCell);
                    }
                }
            }

            // enable drag over empty cells
            emptyCells = gridEl.find(".empty-cell-inner");
            emptyCells.bind("dragover", function (e) {
                if (e.preventDefault) {
                    e.preventDefault(); // allows us to drop
                }

                // highlight all cells when moving module
                var mod = gridEl.find(".move");
                gridEl.find(".empty-cell-inner").removeClass("over");
                if(mod.length == 1) {
                    var targetCell = $(e.target);
                    var offsetX = mod.data("offsetX") ? mod.data("offsetX") : 0;
                    var offsetY = mod.data("offsetY") ? mod.data("offsetY") : 0;
                    for (var x = 0; x < mod.data("w"); x++) {
                        for (var y = 0; y < mod.data("h"); y++) {
                            gridEl.find("#cell-" + (targetCell.data("x") + x - offsetX) + (targetCell.data("y") + y - offsetY)).addClass("over");
                        }
                    }
                }

                return false;
            });
            emptyCells.bind("dragleave", function () {
                gridEl.find(".empty-cell-inner").removeClass("over");
            });
            bindEmptyCellDrop();
        };

        // authorize drop over empty cells
        var bindEmptyCellDrop = function () {
            if (dropCallback) {
                var emptyCells = gridEl.find(".empty-cell-inner");
                emptyCells.bind("drop", function (e) {
                    if (e.stopPropagation) e.stopPropagation(); // stops the browser from redirecting...why???

                    var mod = $(e.target);
                    mod.removeClass("over");

                    dropCallback(e, JSON.parse(e.originalEvent.dataTransfer.getData('text/plain')));
                });
            }
        };

        return {
            setGridSize: function (gridSize) {
                size = gridSize;
                computeGrid();
            },

            setModulesInstances: function (list) {
                modulesInstances = list;
                computeGrid();
            },

            listenToDrop: function (callback) {
                dropCallback = callback;
                bindEmptyCellDrop();
            }
        }
    }
);