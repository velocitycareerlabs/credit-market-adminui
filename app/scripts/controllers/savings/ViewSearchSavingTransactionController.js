(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewSearchSavingTransactionController: function (scope, routeParams, resourceFactory, paginatorService, location, $uibModal, route, dateFilter, $sce, $rootScope, API_VERSION) {
            scope.transactionTypes = [
                {option: "All", value: ""},
                {option: "Deposit", value: "1"},
                {option: "Withdrawal", value: "2"},
                {option: "Interest Posting", value: "3"}
            ];
            scope.report = false;
            scope.hidePentahoReport = true;
            scope.showActiveCharges = true;
            scope.formData = {};
            scope.date = {};
            scope.staffData = {};
            scope.fieldOfficers = [];
            scope.savingaccountdetails = [];
            scope.orisavingaccountdetails = [];
            scope.hideAccrualTransactions = true;
            scope.subStatus = false;

            scope.transactionsPerPage = 15;

            scope.isDebit = function (savingsTransactionType) {
                return savingsTransactionType.withdrawal == true || savingsTransactionType.feeDeduction == true
                    || savingsTransactionType.overdraftInterest == true || savingsTransactionType.withholdTax == true
                    || savingsTransactionType.stampDuty == true;
            };


            /***
             * we are using orderBy(https://docs.angularjs.org/api/ng/filter/orderBy) filter to sort fields in ui
             * api returns dates in array format[yyyy, mm, dd], converting the array of dates to date object
             * @param dateFieldName
             */
            scope.convertDateArrayToObject = function (dateFieldName) {
                for (var i in scope.savingaccountdetails.transactions) {
                    scope.savingaccountdetails.transactions[i][dateFieldName] = new Date(scope.savingaccountdetails.transactions[i].date);
                }
            };

            scope.getResultsPage = function (pageNumber) {
                if (location.search().savingsId != null) {
                    scope.getSavingsTransactions(pageNumber);
                } else if (location.search().recurringDepositId != null) {
                    scope.getRecurringDepositTransactions(pageNumber);
                } else if (location.search().fixedDepositId != null) {
                    scope.getFixedDepositTransactions(pageNumber);
                }
            }

            scope.routeTo = function (savingsAccountId, transactionId, accountTransfer) {
                if (location.search().savingsId != null) {
                    location.path('/viewsavingtrxn/' + savingsAccountId + '/trxnId/' + transactionId);
                } else if (location.search().recurringDepositId != null) {
                    location.path('/viewrecurringdepositaccounttrxn/' + savingsAccountId + '/' + transactionId);
                } else if (location.search().fixedDepositId != null) {
                    location.path('/viewfixeddepositaccounttrxn/' + savingsAccountId + '/' + transactionId);
                }
            };

            scope.getSavingsTransactions = function (pageNumber) {
                var items = resourceFactory.savingsResource.get({
                    accountId: location.search().savingsId,
                    associations: 'all',
                    pageNumber: pageNumber, pageSize: scope.transactionsPerPage
                }, function (data) {
                    scope.savingaccountdetails = data;
                    scope.convertDateArrayToObject('date');
                    if (scope.savingaccountdetails.transactions) {
                       scope.totalTransactions = data.transactionCount;
                    }
                });
            }

            scope.getFixedDepositTransactions = function (pageNumber) {
                resourceFactory.fixedDepositAccountResource.get({
                    accountId: location.search().fixedDepositId, associations: 'all',
                    pageNumber: pageNumber, pageSize: scope.transactionsPerPage
                }, function (data) {
                    scope.savingaccountdetails = data;
                    scope.convertDateArrayToObject('date');
                    if (scope.savingaccountdetails.transactions) {
                        scope.totalTransactions = data.transactionCount;
                    }
                });
            }

            scope.getRecurringDepositTransactions = function (pageNumber) {
                resourceFactory.recurringDepositAccountResource.get({
                    accountId: location.search().recurringDepositId, associations: 'all',
                    pageNumber: pageNumber, pageSize: scope.transactionsPerPage
                }, function (data) {
                    scope.savingaccountdetails = data;
                    scope.convertDateArrayToObject('date');
                    if (scope.savingaccountdetails.transactions) {
                        scope.totalTransactions = data.transactionCount;
                    }
                });
            }

            if(location.search().orisavingaccountdetails != null){
                scope.orisavingaccountdetails = location.search().orisavingaccountdetails;
            }

            if (location.search().savingsId != null) {
                //scope.getSavingsAccruals(1); //not calling api on load
                scope.formData.savingsaccountId = location.search().savingsId;
                scope.isCollapsed = true;
                scope.displayResults = false;
                scope.isValid = true;
                scope.path = "#/viewsavingaccount/" + location.search().savingsId;
            }
            if (location.search().recurringDepositId != null) {
                //scope.getRecurringDepositAccruals(1); //not calling api on load
                scope.formData.savingsaccountId = location.search().recurringDepositId;
                scope.isCollapsed = true;
                scope.displayResults = false;
                scope.isValid = true;
                scope.path = "#/viewrecurringdepositaccount/" + location.search().recurringDepositId;
            }

            if (location.search().fixedDepositId != null) {
                //scope.getFixedDepositAccruals(1); //not calling api on load
                scope.formData.savingsaccountId = location.search().fixedDepositId;
                scope.isCollapsed = true;
                scope.displayResults = false;
                scope.isValid = true;
                scope.path = "#/viewfixeddepositaccount/" + location.search().fixedDepositId;
            }

            /// saving transaction search function - starts
            scope.searchTransactionFunction = function (pageNumber) {
                scope.displayResults = true;
                scope.isCollapsed = false;

                var reqFirstDate = dateFilter(scope.date.first, scope.df);
                var reqSecondDate = dateFilter(scope.date.second, scope.df);
                var params = {};
                params.locale = scope.optlang.code;
                params.dateFormat = scope.df;
                params.accountId = location.search().savingsId;
                params.associations = 'all';
                params.pageNumber = pageNumber;
                params.pageSize = scope.transactionsPerPage;

                if (scope.date.first) {
                    params.fromDate = reqFirstDate;
                }

                if (scope.date.second) {
                    params.toDate = reqSecondDate;
                }

                if (scope.formData.transactionId) {
                    params.trxnId = scope.formData.transactionId;
                }

                if (scope.formData.notesdescriptionsearch) {
                    params.notesOrdesc = scope.formData.notesdescriptionsearch;
                }

                if (scope.formData.transactionAmount) {
                    params.trxnAmount = scope.formData.transactionAmount;
                }

                if (scope.formData.transactionType) {
                    params.trxnType = scope.formData.transactionType;
                }

                var items = resourceFactory.savingsResource.get( params, function (data) {
                    scope.savingaccountdetails = data;
                    scope.convertDateArrayToObject('date');
                    if (scope.savingaccountdetails.transactions) {
                       scope.totalTransactions = data.transactionCount;
                    }
                });
            }

            scope.clearFilters = function () {
                scope.date.first = null;
                scope.date.second = null;
                scope.formData.transactionId = null;
                scope.formData.transactionAmount = null;
                document.getElementById('transactionTypes_chosen').childNodes[0].childNodes[0].innerHTML = "Select transaction type";
            };

            ///saving search transaction function - ends

            scope.printReport = function () {
                window.print();
                window.close();
            };


            scope.transactionSort = {
                column: 'date',
                descending: true
            };

            scope.changeTransactionSort = function (column) {
                var sort = scope.transactionSort;
                if (sort.column == column) {
                    sort.descending = !sort.descending;
                } else {
                    sort.column = column;
                    sort.descending = true;
                }
            };
        }
    });
    mifosX.ng.application.controller('ViewSearchSavingTransactionController', ['$scope', '$routeParams', 'ResourceFactory', 'PaginatorService', '$location', '$uibModal', '$route', 'dateFilter', '$sce', '$rootScope', 'API_VERSION', mifosX.controllers.ViewSearchSavingTransactionController]).run(function ($log) {
        $log.info("ViewSearchSavingTransactionController initialized");
    });
}(mifosX.controllers || {}));
