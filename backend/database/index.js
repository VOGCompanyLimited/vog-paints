const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function createModel(name, opts = {}) {
  const db = new Datastore({ filename: path.join(dataDir, `${name}.db`), autoload: true, timestampData: true });

  function toObj(doc) {
    if (!doc) return null;
    return { ...doc, _id: doc._id.toString(), id: doc._id.toString() };
  }

  function toObjList(docs) { return docs.map(toObj); }

  function buildQuery(query) {
    if (!query || Object.keys(query).length === 0) return {};
    const q = { ...query };
    if (q._id && typeof q._id === 'string') q._id = q._id;
    return q;
  }

  const api = {
    db,

    async find(query = {}, options = {}) {
      return new Promise((resolve, reject) => {
        let s = db.find(buildQuery(query));
        if (options.sort) s = s.sort(options.sort);
        if (options.skip) s = s.skip(options.skip);
        if (options.limit) s = s.limit(options.limit);
        if (options.select) s = s.select(options.select);
        s.exec((err, docs) => {
          if (err) return reject(err);
          resolve(toObjList(docs));
        });
      });
    },

    async findOne(query = {}) {
      return new Promise((resolve, reject) => {
        db.findOne(buildQuery(query), (err, doc) => {
          if (err) return reject(err);
          resolve(toObj(doc));
        });
      });
    },

    async findById(id) {
      return api.findOne({ _id: id });
    },

    async create(data) {
      return new Promise((resolve, reject) => {
        const doc = { ...data };
        if (doc._id) delete doc._id;
        db.insert(doc, (err, doc) => {
          if (err) return reject(err);
          resolve(toObj(doc));
        });
      });
    },

    async insertMany(dataArray) {
      return new Promise((resolve, reject) => {
        db.insert(dataArray.map(d => { const c = {...d}; delete c._id; return c; }), (err, docs) => {
          if (err) return reject(err);
          resolve(toObjList(docs));
        });
      });
    },

    async update(query, updateData, options = {}) {
      return new Promise((resolve, reject) => {
        db.update(buildQuery(query), { $set: updateData }, { multi: options.multi || false, returnUpdatedDocs: true, upsert: options.upsert || false }, (err, num, docs) => {
          if (err) return reject(err);
          resolve(options.multi ? toObjList(docs) : toObj(docs));
        });
      });
    },

    async findByIdAndUpdate(id, updateData, options = {}) {
      const result = await api.update({ _id: id }, updateData, { ...options, multi: false });
      if (options.new === false) return api.findById(id);
      return result;
    },

    async findByIdAndDelete(id) {
      return new Promise((resolve, reject) => {
        db.remove({ _id: id }, {}, (err, num) => {
          if (err) return reject(err);
          resolve({ deleted: num > 0 });
        });
      });
    },

    async remove(query) {
      return new Promise((resolve, reject) => {
        db.remove(buildQuery(query), { multi: true }, (err, num) => {
          if (err) return reject(err);
          resolve({ deleted: num });
        });
      });
    },

    async countDocuments(query = {}) {
      return new Promise((resolve, reject) => {
        db.count(buildQuery(query), (err, count) => {
          if (err) return reject(err);
          resolve(count);
        });
      });
    },

    async aggregate(pipeline) {
      const all = await api.find();
      let result = [...all];
      for (const stage of pipeline) {
        if (stage.$match) {
          result = result.filter(item => {
            return Object.entries(stage.$match).every(([key, val]) => {
              if (typeof val === 'object' && val.$ne) return item[key] !== val.$ne;
              if (typeof val === 'object' && val.$gte) return item[key] >= val.$gte;
              if (typeof val === 'object' && val.$lte) return item[key] <= val.$lte;
              if (typeof val === 'object' && val.$regex) return new RegExp(val.$regex, val.$options || '').test(item[key]);
              return item[key] === val;
            });
          });
        }
        if (stage.$group) {
          const grouped = {};
          result.forEach(item => {
            const key = stage.$group._id ? item[stage.$group._id] : null;
            if (!grouped[key]) grouped[key] = {};
            Object.entries(stage.$group).forEach(([k, v]) => {
              if (k === '_id') return;
              if (v.$sum) grouped[key][k] = (grouped[key][k] || 0) + (typeof v.$sum === 'string' ? (item[v.$sum] || 0) : 1);
              if (v.$avg) { /* skip for simplicity */ }
            });
          });
          result = Object.entries(grouped).map(([key, val]) => ({ _id: key, ...val }));
        }
        if (stage.$sort) {
          const key = Object.keys(stage.$sort)[0];
          const dir = stage.$sort[key];
          result.sort((a, b) => dir * (a[key] > b[key] ? 1 : -1));
        }
        if (stage.$limit) result = result.slice(0, stage.$limit);
      }
      return result;
    }
  };

  return api;
}

const db = {
  users: createModel('users'),
  products: createModel('products'),
  orders: createModel('orders'),
  colors: createModel('colors'),
  reviews: createModel('reviews'),
  settings: createModel('settings')
};

module.exports = db;
