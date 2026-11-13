path = r'c:\Users\japhet\Downloads\zadesk\frontend\src\components\landing\Hero.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Clean unused step timer
old_timer = """  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  const rotateX = Math.max(0, 6 - scrollY * 0.02);
  const scale = Math.min(1.02, 0.98 + scrollY * 0.0002);"""

new_timer = """  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);"""

if old_timer in content:
    content = content.replace(old_timer, new_timer)
    print("Timer replaced!")
else:
    print("Timer NOT found!")

mockup_start = "        {/* Live Interactive Product Mockup Container (High-Contrast 3D View with Scroll Parallax) */}"
mockup_end = "        </div>\n\n      </div>\n    </section>"

start_idx = content.find(mockup_start)
end_idx = content.find(mockup_end)

if start_idx != -1 and end_idx != -1:
    new_mockup = "        {/* Authentic Zadesk Workspace Live Showcase with Immersive Scroll 3D Parallax */}\n        <WorkspaceLiveShowcase scrollY={scrollY} />\n"
    content = content[:start_idx] + new_mockup + content[end_idx + len("        </div>\n"):]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Mockup replaced successfully!")
else:
    print("Mockup markers NOT found!", start_idx, end_idx)

