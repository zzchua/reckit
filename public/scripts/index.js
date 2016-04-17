define(function(require) {
    var common = require('./common');
    var ref = common.ref;
    window.onload = function() {
        // TODO: 2 calls to getAuth, one in common
        var authData = ref.getAuth();
        if (authData) {
            // user is logged in, redirect to feed.
            window.location = "feed.html";
        } else {
            document.getElementById("login").onclick = callLogin;
        }
    };

    function callLogin() {
        ref.authWithOAuthPopup("facebook", function(error, authData) {
            if (error) {
                alert("Login Failed!");
            } else {
                var userRef = ref.child("users");
                var uid = authData.uid;
                var name = authData.facebook.displayName;
                var profileImage = authData.facebook.profileImageURL;
                userRef.child(uid).transaction(function(userData) {
                    if (!userData) {
                        return {
                                    displayName: name,
                                    profileImage: profileImage
                                    };
                    } else {
                        alert("Successfully authenticated");
                    }
                });
                // Things to do after auth:
                // set cookie:
                document.cookie = "uid=" + authData.uid;
                // redirect to username if not created, else go to feed.
                common.checkHandle();
            }
        });
    }
});

