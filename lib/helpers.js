// returns context with user info in it if the user is logged in
async function createUserContext(req) {
    let context = {};

    try {
        let userinfo = await req.oidc.fetchUserInfo();
        if (userinfo) {
            context.user = {};
            context.user.first_name = userinfo.FirstName;
            context.user.last_name = userinfo.LastName;
            context.user.id = userinfo.sub;
            context.user.email_address = userinfo.preferred_username;
        }
        return context;
    } catch (err) {
        console.log(err);
    }
}

module.exports.createUserContext = createUserContext;