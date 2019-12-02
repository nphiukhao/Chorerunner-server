const bcrypt = require('bcryptjs');
const xss = require('xss');

const HouseholdsService = {
  insertHousehold(db, newHousehold) {
    return db
      .insert(newHousehold)
      .into('households')
      .returning('*')
      .then(([household]) => household);
  },
  deleteHousehold(db, id) {
    return db('households')
      .where({id})
      .first()
      .delete();
  },
  insertTask(db, newTask) {
    return db
      .insert(newTask)
      .into('tasks')
      .returning('*');
  },
  getMemberTasks(db, householdId, memberId) {
    return db
      .select('tasks.id', 'tasks.title', 'tasks.points')
      .from('tasks')
      .where('tasks.household_id', householdId)
      .andWhere('tasks.member_id', memberId)
      .groupBy('tasks.id', 'tasks.title', 'tasks.points');
  },
  getAllHouseholds(db, id) {
    return db
      .select('*')
      .from('households')
      .where('user_id', id);
  },
  getTasksForAll(db, household_id) {
    return db
      .select('tasks.id', 'member_id', 'title', 'points', 'name' )
      .from('tasks')
      .leftJoin('members', 'members.id', 'tasks.member_id')
      .where('members.household_id', household_id);
  },
  getAllMembers(db, id) {
    return db
      .select('*')
      .from('members')
      .where('household_id', id);
  },
  hasMemberwithMemberName(db, username) {
    return db('members')
      .where({ username })
      .first()
      .then(member => !!member);
  },
  insertMember(db, newMember) {
    return db
      .insert(newMember)
      .into('members')
      .returning('*')
      .then(([member]) => member);
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeMember(member) {
    return {
      id: member.id,
      name: member.name,
      username: member.username,
      household_id: member.household_id,
      parent_id: member.user_id,
    };
  },

  //THIS METHOD IS NOT FOR DELETING A TASK. IT WILL ULTIMATELY NEED TO ASSIGN POINTS...
  //SOMEHOW.
  completeTask(db, member_id, household_id, taskId) {
    return db('tasks')
      .where('tasks.member_id', member_id)
      .andWhere('tasks.household_id', household_id)
      .andWhere('tasks.id', taskId)
      .delete();
  },

  //For patch method on router "/:id"
  serializeHousehold(household) {
    return {
      id: household.id,
      name: xss(household.name),
      user_id: household.user_id
    }
  },

  updateHouseholdName(db, id, newHousehold) {
    return db
      .from('households')
      .where({ id })
      .update(newHousehold)
  },

};

module.exports = HouseholdsService;
