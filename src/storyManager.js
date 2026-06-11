export class StoryManager {
  constructor() {
    this.activeQuests = new Set();
  }

  startQuest(id) {
    if (this.activeQuests.has(id)) return;
    this.activeQuests.add(id);
    console.log('Quest started:', id);
  }

  completeQuest(id) {
    if (!this.activeQuests.has(id)) return;
    this.activeQuests.delete(id);
    console.log('Quest completed:', id);
  }
}
