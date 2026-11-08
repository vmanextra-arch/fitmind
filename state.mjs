import { api } from "./api.mjs";
export const emptyState = () => ({
  profile: null,
  workouts: [],
  checkins: {},
  food: {},
  overrides: {},
});
export class StateStore {
  constructor(user, onStatus = () => {}) {
    this.user = user;
    this.status = (value) => {
      this.lastStatus = value;
      onStatus(value);
    };
    this.key = "fitmind-vps:" + user.id;
    this.state = emptyState();
    this.revision = 0;
    this.generation = 0;
    this.dirty = false;
    this.busy = false;
    this.conflict = false;
    this.onlineHandler = () => this.save();
    window.addEventListener("online", this.onlineHandler);
  }
  cache() {
    try {
      localStorage.setItem(
        this.key,
        JSON.stringify({
          state: this.state,
          revision: this.revision,
          dirty: this.dirty,
        }),
      );
    } catch {
      this.status("error");
      this.lastError =
        "Не удалось сохранить локальную копию: проверь свободное место браузера";
    }
  }
  async load() {
    let cached;
    try {
      cached = JSON.parse(localStorage.getItem(this.key) || "null");
    } catch {}
    if (cached?.state) {
      this.state = cached.state;
      this.revision = cached.revision;
      this.dirty = cached.dirty;
    }
    try {
      const remote = await api("/state");
      if (this.dirty && this.revision !== remote.revision) {
        this.conflict = true;
        this.status("conflict");
        return;
      }
      if (!this.dirty) {
        this.state = remote.state || emptyState();
        this.revision = remote.revision;
        this.cache();
      }
      this.status(this.dirty ? "pending" : "saved");
      if (this.dirty) this.schedule();
    } catch (error) {
      if (error.status !== 0) throw error;
      this.status("offline");
    }
  }
  update(change) {
    change(this.state);
    this.generation++;
    this.dirty = true;
    this.cache();
    this.status("pending");
    this.schedule();
  }
  schedule() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.save(), 700);
  }
  async save() {
    if (!this.dirty || this.conflict || !this.state.profile) return;
    if (this.busy) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.save();
    }
    this.busy = true;
    const generation = this.generation;
    try {
      this.status("saving");
      const result = await api("/state", {
        method: "PUT",
        data: { state: this.state, revision: this.revision },
      });
      this.lastError = null;
      this.revision = result.revision;
      if (this.generation === generation) this.dirty = false;
      this.cache();
      this.status(this.dirty ? "pending" : "saved");
      if (this.dirty) this.schedule();
    } catch (error) {
      if (error.status === 409) {
        this.conflict = true;
        this.status("conflict");
      } else {
        this.status(error.status === 0 ? "offline" : "error");
        this.lastError = error.message;
      }
    } finally {
      this.busy = false;
    }
  }
  async resolveConflict(useLocal) {
    const remote = await api("/state");
    if (!useLocal) {
      this.state = remote.state || emptyState();
      this.dirty = false;
    }
    this.revision = remote.revision;
    this.conflict = false;
    this.cache();
    if (useLocal) await this.save();
    else this.status("saved");
  }
  acceptServer(state, revision, expectedGeneration) {
    // A delayed advice response can carry an older snapshot than an autosave.
    if (revision < this.revision) return false;
    if (expectedGeneration !== undefined &&
        (this.generation !== expectedGeneration || this.dirty || this.busy)) {
      // Keep the local draft; require an explicit choice if the server changed.
      if (revision > this.revision) {
        this.conflict = true;
        this.status("conflict");
      }
      return false;
    }
    this.state = state;
    this.revision = revision;
    this.dirty = false;
    this.generation++;
    this.cache();
    this.status("saved");
    return true;
  }
  destroy() {
    clearTimeout(this.timer);
    window.removeEventListener("online", this.onlineHandler);
  }
}
