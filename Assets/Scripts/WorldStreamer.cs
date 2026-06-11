using UnityEngine;
using System.Collections;
using UnityEngine.SceneManagement;

public class WorldStreamer : MonoBehaviour
{
    public float loadDistance = 200f;
    public Transform player;

    [System.Serializable]
    public class Region { public string sceneName; public Vector3 center; public float radius; public bool isLoaded; }

    public Region[] regions;

    void Update()
    {
        if (player == null) return;
        foreach (var r in regions)
        {
            float d = Vector3.Distance(player.position, r.center);
            if (!r.isLoaded && d <= loadDistance + r.radius)
            {
                StartCoroutine(LoadRegion(r));
            }
            if (r.isLoaded && d > loadDistance + r.radius + 50f)
            {
                StartCoroutine(UnloadRegion(r));
            }
        }
    }

    IEnumerator LoadRegion(Region r)
    {
        if (r.isLoaded) yield break;
        var ao = SceneManager.LoadSceneAsync(r.sceneName, LoadSceneMode.Additive);
        while (!ao.isDone) yield return null;
        r.isLoaded = true;
    }

    IEnumerator UnloadRegion(Region r)
    {
        if (!r.isLoaded) yield break;
        var ao = SceneManager.UnloadSceneAsync(r.sceneName);
        while (!ao.isDone) yield return null;
        r.isLoaded = false;
    }
}
