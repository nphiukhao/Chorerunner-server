const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UserService = {
  hasUserWithUserName(db, username) {
    return db('users')
      .where({ username })
      .first()
      .then(users => !!users);
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([users]) => users);
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character';
    }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeUser(users) {
    return {
      id: users.id,
      name: users.name,
      username: users.username,
    };
  },

  getUserAccount(db, id) {
    return (
      db
        .select(
          'users.name as user',
          // 'members.name as member',
          // 'members.id as memberId',
          'households.id as householdId',
          'households.name as housename'
        )
        .from('users')
        .join('households', 'households.user_id', '=', 'users.id')
        // .join('members', 'members.household_id', '=', 'households.id')
        .where('users.id', id)
        .groupBy('user', 'householdId', 'housename')
    );
  },
};

module.exports = UserService;
