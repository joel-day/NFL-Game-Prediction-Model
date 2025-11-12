# NFL Game Prediction Model "ChalkJuice"

[Use the Model](https://www.chalkjuice.com)

![Solution Image](data/chalkjuice_diagram.png)
link to diagram 'https://excalidraw.com/#json=aa60tQfZB0d3HoVcrRHSj,0hysc_ad41UkUoPTq4dhgQ'

Machine Learning and a dataset of all previous NFL matchups are used to predict the amount of times a team will win against the provided opponent. 

When a team wins in an actual NFL matchup, the winning team isnt neccesarily the better team, it was just the better team that day. This model simulates a matchup 100 times, providing a better understaning of which team is better. 

You can compare teams from different years or the same team over different years.

It does so by 1- generating what the team is expected to score - considering the strength of their offense and the strength of the opponent's defense. 2- generate a score around that mean based on how much scores typically vary across real historical matchups. 

NOTE: The first 34 games of a teams existance for model training, so those initial games are not suitbale for use in the model. 





