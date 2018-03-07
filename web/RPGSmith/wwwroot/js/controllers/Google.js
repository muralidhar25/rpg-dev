function googleSignIn() {
    
    gapi.load('auth2,signin2', function () {
        var auth2 = gapi.auth2.init();
        auth2.then(function () {
            // Current values
            var isSignedIn = auth2.isSignedIn.get();
            var currentUser = auth2.currentUser.get();

            if (!isSignedIn) {
                // Rendering g-signin2 button.
                gapi.signin2.render('signInGoogle', {
                    'onsuccess': 'onSignIn'
                });
            }
            else {
                if (confirm("Continue with Goole Account") == true) {
                    gapi.signin2.render('signInGoogle', {
                        'onsuccess': 'onSignIn'
                    });
                } else {
                    signOut();

                }
            }
        });
    });
}



function onSignIn(googleUser) {
    
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if
    console.log('Access' + googleUser.getAuthResponse().id_token);
    isUserRegistered(profile.getEmail(), profile.getId(), googleUser.getAuthResponse().id_token);
}

function onSignInFailure() {
    // Handle sign-in errors
    alert('failure');
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        gapi.signin2.render('signInGoogle', {
            'onsuccess': 'onSignIn'
        });
    });
}

function isUserRegistered(Email, Id, accessToken) {
    $.ajax({
        url: '/Account/GoogleLogin',
        method: 'GET',
        data: {
            Email: Email,
            AccesKey: Id,
            AccountType: 'Google'
        },
        success: function (response) {
            if (response != null) {
                angular.element('#profileImage').scope().gotoHomepage();
            }
            else {
                window.location.href = "/views/home/login.html"
            }
        }
    });
}

