// Your Move file stays the SAME, just deploy to testnet
module portfolio::portfolio {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::String;

    struct Portfolio has key, store {
        id: UID,
        name: String,
        course: String,
        school: String,
        about: String,
        linkedin_url: String,
        github_url: String,
        skills: vector<String>,
        profile_photo_object_id: String,  // ADDED
    }

    public fun create_portfolio(
        sender: address,
        name: String,
        course: String,
        school: String,
        about: String,
        linkedin_url: String,
        github_url: String,
        skills: vector<String>,
        profile_photo_object_id: String,  // ADDED
        ctx: &mut TxContext
    ) {
        let portfolio = Portfolio {
            id: object::new(ctx),
            name,
            course,
            school,
            about,
            linkedin_url,
            github_url,
            skills,
            profile_photo_object_id,  // ADDED
        };
        transfer::transfer(portfolio, sender);
    }

    public entry fun update_profile_photo(
        portfolio: &mut Portfolio,
        new_profile_photo_object_id: String,
    ) {
        portfolio.profile_photo_object_id = new_profile_photo_object_id;
    }
}