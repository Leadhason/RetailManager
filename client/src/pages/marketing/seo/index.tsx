import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Search, TrendingUp, Eye, Globe, CheckCircle, AlertCircle, XCircle, BarChart3 } from "lucide-react";

interface SEOMetric {
  page: string;
  title: string;
  metaDescription: string;
  score: number;
  issues: string[];
  keywords: string[];
  visits: number;
  position: number;
}

export default function SEOToolsIndex() {
  const [activeTab, setActiveTab] = useState("overview");
  const [keywordInput, setKeywordInput] = useState("");
  const { toast } = useToast();

  const [seoData] = useState<SEOMetric[]>([
    {
      page: "/products",
      title: "Professional Tools & Equipment | EDMAX",
      metaDescription: "Discover our wide range of professional tools and equipment for construction, electrical, and industrial needs.",
      score: 85,
      issues: ["Missing alt tags on 2 images"],
      keywords: ["professional tools", "construction equipment", "power tools"],
      visits: 1247,
      position: 3
    },
    {
      page: "/categories/power-tools",
      title: "Power Tools - Electric & Battery Powered | EDMAX",
      metaDescription: "Shop the best power tools including drills, saws, grinders and more from top brands.",
      score: 92,
      issues: [],
      keywords: ["power tools", "electric drills", "battery tools"],
      visits: 892,
      position: 1
    },
    {
      page: "/products/drill-set",
      title: "Professional Drill Set",
      metaDescription: "",
      score: 45,
      issues: ["Missing meta description", "Title too short", "H1 tag missing"],
      keywords: ["drill set", "professional drill"],
      visits: 324,
      position: 15
    }
  ]);

  const [keywordTracking] = useState([
    { keyword: "power tools", position: 3, change: +2, volume: 12000, difficulty: "Medium" },
    { keyword: "construction equipment", position: 7, change: -1, volume: 8500, difficulty: "High" },
    { keyword: "electric drills", position: 1, change: 0, volume: 5200, difficulty: "Low" },
    { keyword: "safety equipment", position: 12, change: +5, volume: 3800, difficulty: "Medium" },
    { keyword: "building materials", position: 8, change: -2, volume: 9200, difficulty: "High" }
  ]);

  const handleAnalyzePage = (page: string) => {
    toast({
      title: "Page Analysis",
      description: `Analyzing SEO for ${page} (feature coming soon)`,
    });
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      toast({
        title: "Keyword Added",
        description: `Now tracking "${keywordInput}" (feature coming soon)`,
      });
      setKeywordInput("");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPositionChange = (change: number) => {
    if (change > 0) return { icon: TrendingUp, color: "text-green-600", text: `+${change}` };
    if (change < 0) return { icon: TrendingUp, color: "text-red-600", text: `${change}` };
    return { icon: TrendingUp, color: "text-gray-600", text: "0" };
  };

  const avgScore = seoData.reduce((sum, item) => sum + item.score, 0) / seoData.length;
  const totalIssues = seoData.reduce((sum, item) => sum + item.issues.length, 0);
  const totalVisits = seoData.reduce((sum, item) => sum + item.visits, 0);
  const avgPosition = keywordTracking.reduce((sum, item) => sum + item.position, 0) / keywordTracking.length;

  return (
    <div className="space-y-6" data-testid="seo-tools-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Tools</h1>
          <p className="text-muted-foreground">
            Optimize your website for search engines and track keyword rankings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button>
            <Search className="w-4 h-4 mr-2" />
            Analyze Site
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg SEO Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
              {avgScore.toFixed(0)}/100
            </div>
            <p className="text-xs text-muted-foreground">Website optimization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalIssues}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organic Traffic</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Position</CardTitle>
            <Globe className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPosition.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Search ranking</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">SEO Overview</TabsTrigger>
          <TabsTrigger value="keywords">Keyword Tracking</TabsTrigger>
          <TabsTrigger value="optimization">Page Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Performance Overview</CardTitle>
              <CardDescription>Current state of your website's search engine optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall SEO Health</span>
                    <span className={`text-sm font-medium ${getScoreColor(avgScore)}`}>
                      {avgScore.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={avgScore} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      What's Working Well
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Strong keyword rankings for "power tools"</li>
                      <li>• Good page loading speeds</li>
                      <li>• Mobile-friendly design</li>
                      <li>• SSL certificate installed</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center">
                      <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• {totalIssues} SEO issues need fixing</li>
                      <li>• Missing meta descriptions on some pages</li>
                      <li>• Image alt tags need optimization</li>
                      <li>• Internal linking could be improved</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Tracking</CardTitle>
              <CardDescription>Monitor your search engine rankings for target keywords</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Enter keyword to track..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddKeyword}>Add Keyword</Button>
                </div>

                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="p-3 font-medium">Keyword</th>
                          <th className="p-3 font-medium">Position</th>
                          <th className="p-3 font-medium">Change</th>
                          <th className="p-3 font-medium">Volume</th>
                          <th className="p-3 font-medium">Difficulty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {keywordTracking.map((item, index) => {
                          const positionChange = getPositionChange(item.change);
                          return (
                            <tr key={index} className="border-b hover:bg-muted/50">
                              <td className="p-3 font-medium">{item.keyword}</td>
                              <td className="p-3">
                                <Badge variant="outline">#{item.position}</Badge>
                              </td>
                              <td className="p-3">
                                <div className={`flex items-center ${positionChange.color}`}>
                                  <positionChange.icon className="w-3 h-3 mr-1" />
                                  {positionChange.text}
                                </div>
                              </td>
                              <td className="p-3 text-muted-foreground">
                                {item.volume.toLocaleString()}/mo
                              </td>
                              <td className="p-3">
                                <Badge variant={
                                  item.difficulty === 'Low' ? 'default' :
                                  item.difficulty === 'Medium' ? 'secondary' : 'destructive'
                                }>
                                  {item.difficulty}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Optimization</CardTitle>
              <CardDescription>Review and improve SEO for individual pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {seoData.map((page, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{page.page}</h4>
                        <div className={`text-sm font-medium ${getScoreColor(page.score)}`}>
                          {page.score}/100
                        </div>
                        <Progress value={page.score} className="h-1 w-20" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnalyzePage(page.page)}
                      >
                        Analyze
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Title:</span> {page.title}
                      </div>
                      <div>
                        <span className="font-medium">Meta Description:</span> {
                          page.metaDescription || <span className="text-red-500">Missing</span>
                        }
                      </div>
                      <div className="flex items-center space-x-4 text-muted-foreground">
                        <span>{page.visits} visits</span>
                        <span>•</span>
                        <span>Position #{page.position}</span>
                        <span>•</span>
                        <span>{page.keywords.join(', ')}</span>
                      </div>
                      {page.issues.length > 0 && (
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                          <div className="text-orange-600">
                            <span className="font-medium">Issues:</span> {page.issues.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}