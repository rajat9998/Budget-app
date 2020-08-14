var budgetController = (function () {
    
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;        
    };

    var Income = function (id, description, value) {
        this.id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function (type) {
        var sum = 0;        
        data.allItems[type].forEach(element => {
            sum += element.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            // Create new ID
            // ID = last ID + 1
            var len = data.allItems[type].length;
            if (len > 0) {
                ID = data.allItems[type][len - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new Item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        calculateBudget: function () {

            // Calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };  
        },

        testing: function () {
            console.log(data);
        }
    }

})();


var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage'
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,   // either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };            
        },

        addListItem: function (obj, type) {
            var html, element;

            // Create HTML string with placeholder text
            // Replace the placeholder text with some actual data
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = `<div class="item clearfix" id="${obj.id}"> <div class="item__description">${obj.description}</div> <div class="right clearfix"> <div class="item__value">${obj.value}</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>`;    
            } else {
                element = DOMstrings.expensesContainer;

                html = `<div class="item clearfix" id="${obj.id}"> <div class="item__description">${obj.description}</div> <div class="right clearfix"> <div class="item__value">${obj.value}</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>`;   
            }                        
        
            // Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },

        clearFields: function () {
            var fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            var fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(element => {
                element.value = "";                
            });

            fieldsArray[0].focus();
        },

        displayBudget: function (obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = (obj.budget >= 0 ? '+ ' : '- ') + obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = '+ ' + obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = '- ' + obj.totalExp;
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';      
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };
    
})();


var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) { // press enter
                ctrlAddItem();
            }
        });
    };

    var updateBudget = function () {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
        
    var ctrlAddItem = function () {
        
        // 1. Get the input field data
        var input = UICtrl.getInput();        

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. CLear the input field
            UICtrl.clearFields();

            // 5. Calculate and update the budget
            updateBudget();
        }
    };    

    return {
        init: function () {
            console.log('Application has started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);


controller.init();