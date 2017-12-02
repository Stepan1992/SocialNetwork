var app = angular.module('myApp', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider',
function ($routeProvider, $locationProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "index.html",
                controller: "mainCtrl"
            })


            .when('/:activationPath', {
                templateUrl: 'index.html',
                controller: 'mainCtrl',

            })

            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.hashPrefix('');
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }]);



app.controller('mainCtrl', function ($scope, $http, $routeParams, $rootScope, $location, $timeout) {
    $scope.currentView = 'registration';
    $scope.daysArr = [];
    $scope.monthArr = ['січ', 'лют', 'бер', 'трав', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'груд'];
    $scope.yearsArr = [];
    $scope.selectedDay = 7;
    $scope.selectedMonth = 'жов';
    $scope.selectedYear = 1999;


    (function () {
        for (let i = 1; i <= 31; i++) {
            $scope.daysArr.push(i);
        };
        for (let j = new Date().getFullYear(); j >= 1905; j--) {
            $scope.yearsArr.push(j);
        }
    })();

    $scope.namePattern = new RegExp("^[_a-zA-Z0-9а-яА-ЯёЁіІЇіЄє]+$");
    $scope.passPattern = new RegExp("(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$");
    $scope.emailPattern = new RegExp("^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$");
    $scope.numberPattern = /^\+380\d{3}\d{2}\d{2}\d{2}$/;
    $scope.verificationPattern = /^([a-z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)?@[a-z][a-zA-Z-0-9]*\.[a-z]+(\.[a-z]+)?)|[7-9][0-9]{10}$/;



    $scope.enter = function () {

        let obj = {
            emailNum: $scope.userEmail,
            pass: $scope.userPass
        };
        $http.get('http://localhost:8000/login', {
                params: obj
            })
            .then(function successCallback(response) {
                $scope.userResponse = response.data;
                if ($scope.userResponse.length == 0) {
                    console.log('You are not registered')

                } else(console.log('Welcome'))

            }, function errorCallback(response) {
                console.log("Error!!!" + response.err);
            });
    };


    $rootScope.$watch(function () {
            return $location.path();
        },
        function (path) {
            $http.get('http://localhost:8000/getCurrentUser')
                .then(function successCallback(response) {
                    $scope.userData = response.data;

                    if ($scope.userData.length !== 0) {
                        if ($scope.userData[0].status == path.slice(1)) {
                            let obj = {
                                status: 'activated',
                                id: $scope.userData[0].id
                            };

                            $http.post('http://localhost:8000/mailVerification', obj)
                                .then(function successCallback(response) {
                                    $timeout(function () {
                                        $scope.mailVerification = false;
                                        $location.path('/');
                                    }, 300);
                                }, function errorCallback(response) {
                                    console.log("Error!!!" + response.err);
                                });
                        }
                    }
                }, function errorCallback(response) {
                    console.log("Error!!!" + response.err);
                });
        });

    $scope.redClass = function (registrationForm, name) {

        if ((name.$invalid && ((registrationForm.$submitted || name.$touched) && ($scope.redBorder == 'name'))) || (name.$invalid && registrationForm.$submitted && $scope.redBorder != 'name')) {
            return 'redClass';
        }
    };

    $scope.focusValidFunc = function (name) {
        $scope.redBorder = false;
        $scope.warnMass = name;
    };

    $scope.blurValidFunc = function (name) {
        $scope.redBorder = name;
        $scope.warnMass = false;

    };

    $scope.redClassSurname = function (registrationForm, name) {

        if ((name.$invalid && ((registrationForm.$submitted || name.$touched) && ($scope.redBorderSurname == 'surname'))) || (name.$invalid && registrationForm.$submitted && $scope.redBorderSurname != 'surname')) {
            return 'redClass';
        }
    };

    $scope.focusValidFuncSurname = function (name) {
        $scope.redBorderSurname = false;
        $scope.warnMassSurname = name;
    };

    $scope.blurValidFuncSurname = function (name) {
        $scope.redBorderSurname = name;
        $scope.warnMassSurname = false;

    };

    $scope.redClassEmail = function (registrationForm, name) {

        if ((name.$invalid && ((registrationForm.$submitted || name.$touched) && ($scope.redBorderEmail == 'email'))) || (name.$invalid && registrationForm.$submitted && $scope.redBorderEmail != 'email')) {
            return 'redClass';
        }
    };

    $scope.focusValidFuncEmail = function (name) {
        $scope.redBorderEmail = false;
        $scope.warnMassEmail = name;
    };

    $scope.blurValidFuncEmail = function (name) {
        $scope.redBorderEmail = name;
        $scope.warnMassEmail = false;
    };

    $scope.redClassPass = function (registrationForm, name) {

        if ((name.$invalid && ((registrationForm.$submitted || name.$touched) && ($scope.redBorderPass == 'pass'))) || (name.$invalid && registrationForm.$submitted && $scope.redBorderPass != 'pass')) {
            return 'redClass';
        }
    };

    $scope.focusValidFuncPass = function (name) {
        $scope.redBorderPass = false;
        $scope.warnMassPass = name;
    };

    $scope.blurValidFuncPass = function (name) {
        $scope.redBorderPass = name;
        $scope.warnMassPass = false;

    };




    $scope.genderRed = function (registrationForm) {
        if (registrationForm.optionsMale.$invalid && registrationForm.$submitted)
            return 'genderRedClass';

    }

    $scope.addNewUser = function (user, registrationForm) {

        if (registrationForm.$invalid) {} else if (registrationForm.$valid) {
            let obj = {
                status: false,
                emailNumber: $scope.newUser.regUserEmailNumber,
                password: $scope.newUser.regUserPass,
                name: $scope.newUser.regUserName,
                surname: $scope.newUser.regUserSecName,
                birthday: $scope.selectedDay + ' ' + $scope.selectedMonth + ' ' + $scope.selectedYear,
                male: $scope.gender
            };

            $http.post('http://localhost:8000/regNewUser', obj)
                .then(function successCallback(response) {
                }, function errorCallback(response) {
                    console.log("Error!!!" + response.err);
                });

            let email = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(user.regUserEmailNumber);

            let phoneNum = /^\+380\d{3}\d{2}\d{2}\d{2}$/.test(user.regUserEmailNumber);

            if (email) {

                $scope.mail = $scope.newUser.regUserEmailNumber.split('@')[1];
                $scope.mailVerification = true;

                let randomPath = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

                let text = 'Click here ' + ' http://localhost:8000/' + randomPath;

                let mailObj = {
                    toUser: $scope.newUser.regUserEmailNumber,
                    text: text,
                    randomPath: randomPath
                };

                $http.post('http://localhost:8000/mail', mailObj)
                    .then(function successCallback(response) {
                    }, function errorCallback(response) {
                        console.log("Error!!!" + response.err);
                    });

            } else if (phoneNum) {

                let phone = $scope.newUser.regUserEmailNumber;
                let code = Math.floor(Math.random() * (9999 - 1000) + 1000);

                let num = {
                    phone: phone,
                    code: code
                };

                $http.post('http://localhost:8000/nexmo', num)
                    .then(function successCallback(response) {
                        console.log("Success nexmo!");
                        $http.get('http://localhost:8000/getCurrentUser')
                            .then(function successCallback(response) {
                                $scope.userData = response.data;

                                if ($scope.userData.status != 'activated') {
                                    $scope.warrantMassage = true;
                                } else {
                                    $scope.warrantMassage = false;
                                    console.log('Welcome');
                                }

                            }, function errorCallback(response) {
                                console.log("Error!!!" + response.err);
                            });
                    }, function errorCallback(response) {
                        console.log("Error!!!" + response.err);
                    });

                $scope.checkVerification = function () {

                    if ($scope.verificationCode == $scope.userData[0].status) {

                        let obj = {
                            status: 'activated'
                        };
                        $http.post('http://localhost:8000/verification', obj)
                            .then(function successCallback(response) {
                                console.log("Success!");
                            }, function errorCallback(response) {
                                console.log("Error!!!" + response.err);
                            });
                        $scope.warrantMassage = false;
                        console.log('Welcome');
                        $scope.currentView = 'registration';

                    } else {
                        console.log('You typed wrong code, try again');
                    }
                };

            };

            $scope.currentView = 'avatar';
            $scope.avatarPath = '../assets/icons/enhanced-buzz-16839-1297795475-9.jpeg';
        };
    };

    $scope.uploadFile = function () {
        var fd = new FormData();
        fd.append("test", $scope.myFile);
        $http.post('http://localhost:8000/images', fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            })
            .then(function successCallback(response) {
                $scope.avatarPath = response.data;
            }, function errorCallback(response) {
                console.log("Error!!!" + response.err);
            });

    };

    $scope.forgetPassFunc = function () {
        $scope.currentView = 'forgetPass';
    }

    $scope.denyFunc = function () {
        $scope.currentView = 'registration';
    }

    $scope.searchFunc = function (emailOrNum) {

        let email = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(emailOrNum);
        let phoneNum = /^\+\d{2}\d{3}\d{3}\d{2}\d{2}$/.test(emailOrNum);


        if (email || phoneNum) {

            let obj = {
                emailNumber: emailOrNum
            };
            $http.get('http://localhost:8000/searchPass', {
                    params: obj
                })
                .then(function successCallback(response) {
                    $scope.findUser = response.data;
                    if ($scope.findUser.length == 0) {
                        console.log('You are not registered')

                    } else {
                        console.log('checking');
                        $scope.currentView = 'confirmCode';


                        let userEmail = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test($scope.findUser[0].emailNumber);
                        let userPhoneNum = /^\+\d{2}\d{3}\d{3}\d{2}\d{2}$/.test($scope.findUser[0].emailNumber);


                        if (userEmail) {

                            let randomCode = Math.floor(Math.random() * (9999 - 1000) + 1000);

                            let code = 'The code is : ' + randomCode;

                            let codeObj = {
                                toUser: $scope.findUser[0].emailNumber,
                                text: code,
                                randomCode: randomCode,
                                id: $scope.findUser[0].id
                            };

                            $http.post('http://localhost:8000/newUserPass', codeObj)
                                .then(function successCallback(response) {

                                    let idObj = {
                                        id: $scope.findUser[0].id
                                    };
                                    $http.get('http://localhost:8000/searchId', {
                                            params: idObj
                                        })
                                        .then(function successCallback(response) {
                                            $scope.findUser = response.data;

                                            $scope.newCodeFunc = function (code) {
                                                if (code == $scope.findUser[0].status) {
                                                    let forgetPass = $scope.findUser[0].password;
                                                    let pass = {
                                                        toUser: $scope.findUser[0].emailNumber,
                                                        text: 'Your password is ' + forgetPass,
                                                        id: $scope.findUser[0].id,
                                                        status: 'activated'
                                                    };
                                                    $http.post('http://localhost:8000/sendPass', pass)
                                                        .then(function successCallback(response) {
                                                            $scope.currentView = 'registration';
                                                        }, function errorCallback(response) {
                                                            console.log("Error!!!" + response.err);
                                                        });
                                                } else {
                                                    console.log('You typed wrong code')
                                                }
                                            }

                                        }, function errorCallback(response) {
                                            console.log("Error!!!" + response.err);
                                        });

                                }, function errorCallback(response) {
                                    console.log("Error!!!" + response.err);
                                });

                        } else if (userPhoneNum) {

                            let code = Math.floor(Math.random() * (9999 - 1000) + 1000);

                            let num = {
                                phone: $scope.findUser[0].emailNumber,
                                code: code,
                                id: $scope.findUser[0].id
                            };

                            $http.post('http://localhost:8000/nexmoNewPass', num)
                                .then(function successCallback(response) {
                                    let idObj = {
                                        id: $scope.findUser[0].id
                                    };

                                    $http.get('http://localhost:8000/searchId', {
                                            params: idObj
                                        })
                                        .then(function successCallback(response) {
                                            $scope.findUser = response.data;

                                            $scope.newCodeFunc = function (code) {
                                                if (code == $scope.findUser[0].status) {
                                                    $scope.currentView = 'createNewPass';

                                                    $scope.newPassFunc = function (newPass) {

                                                        let newPassObj = {
                                                            status: 'activated',
                                                            password: newPass,
                                                            id: $scope.findUser[0].id
                                                        };

                                                        $http.post('http://localhost:8000/setNewPass', newPassObj)
                                                            .then(function successCallback(response) {
                                                                $scope.currentView = 'registration';
                                                            }, function errorCallback(response) {
                                                                console.log("Error!!!" + response.err);
                                                            });
                                                    }
                                                } else {
                                                    console.log('You typed wrong code');
                                                };
                                            }

                                        }, function errorCallback(response) {
                                            console.log("Error!!!" + response.err);
                                        });
                                }, function errorCallback(response) {
                                    console.log("Error!!!" + response.err);
                                });
                        }
                    }

                }, function errorCallback(response) {
                    console.log("Error!!!" + response.err);
                });
        }
    }
});


app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);



app.directive('avatar', function () {
    return {
        templateUrl: 'templates/avatar.html',
        link: function (scope, element, attrs) {

        }
    }
});
