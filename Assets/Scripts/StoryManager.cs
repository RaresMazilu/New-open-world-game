using UnityEngine;
using System.Collections.Generic;

public class StoryManager : MonoBehaviour
{
    public List<string> activeQuests = new List<string>();

    void Start()
    {
        // TODO: load persistent story state
    }

    public void StartQuest(string id)
    {
        if (!activeQuests.Contains(id)) activeQuests.Add(id);
        // trigger quest start events
        Debug.Log("Quest started: " + id);
    }

    public void CompleteQuest(string id)
    {
        if (activeQuests.Contains(id)) activeQuests.Remove(id);
        Debug.Log("Quest completed: " + id);
        // handle rewards and story progression
    }
}
